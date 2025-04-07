import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import bcrypt from "bcrypt";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

async function comparePasswords(supplied: string, stored: string) {
  return bcrypt.compare(supplied, stored);
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "serena-ai-secret-key",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax"
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
      },
      async (email, password, done) => {
        try {
          const user = await storage.getUserByEmail(email);
          if (!user || !(await comparePasswords(password, user.password))) {
            return done(null, false);
          } else {
            return done(null, user);
          }
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      const { email, password, name, agencyName } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already exists" });
      }

      const hashedPassword = await hashPassword(password);
      const user = await storage.createUser({
        email,
        password: hashedPassword,
        name,
        agencyName
      });

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;

      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: Error | null, user: Express.User | false, info: { message: string } | undefined) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ message: "Invalid email or password" });

      req.login(user, (loginErr) => {
        if (loginErr) return next(loginErr);
        
        // Remove password from response
        const { password, ...userWithoutPassword } = user;
        return res.status(200).json(userWithoutPassword);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    
    // Remove password from response
    const { password, ...userWithoutPassword } = req.user as SelectUser;
    res.json(userWithoutPassword);
  });

  // Password reset request
  app.post("/api/request-password-reset", async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        // For security reasons, always return success even if the email doesn't exist
        return res.status(200).json({ 
          message: "If your email exists in our system, you will receive password reset instructions." 
        });
      }
      
      // Generate a reset token
      const resetToken = randomBytes(32).toString('hex');
      const resetExpiry = new Date(Date.now() + 3600000); // 1 hour from now
      
      // Store the token in the user's record
      await storage.storeResetToken(user.id, resetToken, resetExpiry);
      
      // In a real application, you would send an email with the reset token
      // For this demo, we'll just return the token directly
      return res.status(200).json({ 
        message: "Password reset instructions have been sent to your email.",
        resetToken, // In a production app, you would NOT send this to the client
        email
      });
    } catch (error) {
      console.error("Password reset request error:", error);
      return res.status(500).json({ message: "An error occurred while processing your request" });
    }
  });

  // Reset password with token
  app.post("/api/reset-password", async (req, res) => {
    try {
      const { resetToken, email, newPassword } = req.body;
      
      if (!resetToken || !email || !newPassword) {
        return res.status(400).json({ message: "All fields are required" });
      }
      
      // Verify the token
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(400).json({ message: "Invalid or expired reset token" });
      }
      
      const isValidToken = await storage.validateResetToken(user.id, resetToken);
      if (!isValidToken) {
        return res.status(400).json({ message: "Invalid or expired reset token" });
      }
      
      // Update the password
      const hashedPassword = await hashPassword(newPassword);
      await storage.updateUserPassword(user.id, hashedPassword);
      
      // Clear the reset token
      await storage.clearResetToken(user.id);
      
      return res.status(200).json({ message: "Your password has been updated successfully" });
    } catch (error) {
      console.error("Password reset error:", error);
      return res.status(500).json({ message: "An error occurred while processing your request" });
    }
  });
}
