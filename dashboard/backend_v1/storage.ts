import { calls, users, type User, type InsertUser, type Call, type InsertCall } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import { supabase } from "./db";
import { eq, gte, sql, desc } from "drizzle-orm";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserPassword(userId: number, newPassword: string): Promise<boolean>;
  storeResetToken(userId: number, token: string, expiry: Date): Promise<boolean>;
  validateResetToken(userId: number, token: string): Promise<boolean>;
  clearResetToken(userId: number): Promise<boolean>;
  getCalls(userId: number): Promise<Call[]>;
  getCallStats(userId: number): Promise<{
    totalCalls: number;
    appointmentsBooked: number;
    avgDuration: string;
    avgRating: number;
    callToAppointmentRate: number;
    missedCallsPercentage: number;
    weeklyCallVolume: { day: string; calls: number }[];
    topPerformingDay: string;
    peakCallHours: string;
  }>;
  createCall(call: InsertCall): Promise<Call>;
  seedDemoData(): Promise<void>;
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new (createMemoryStore(session))({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();
    
    if (error) throw error;
    return data;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const createdAt = new Date();
    const { data, error } = await supabase
      .from('users')
      .insert({ 
        ...insertUser, 
        createdAt,
        resetToken: null,
        resetTokenExpiry: null
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async createCall(insertCall: InsertCall): Promise<Call> {
    const { data, error } = await supabase
      .from('calls')
      .insert(insertCall)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateUserPassword(userId: number, newPassword: string): Promise<boolean> {
    const { error } = await supabase
      .from('users')
      .update({ password: newPassword })
      .eq('id', userId);
    
    if (error) throw error;
    return true;
  }

  async storeResetToken(userId: number, token: string, expiry: Date): Promise<boolean> {
    const { error } = await supabase
      .from('users')
      .update({ resetToken: token, resetTokenExpiry: expiry })
      .eq('id', userId);
    
    if (error) throw error;
    return true;
  }

  async validateResetToken(userId: number, token: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('users')
      .select('resetToken, resetTokenExpiry')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    if (!data || !data.resetToken || !data.resetTokenExpiry) return false;

    const isTokenValid = data.resetToken === token;
    const isTokenExpired = new Date() > new Date(data.resetTokenExpiry);

    return isTokenValid && !isTokenExpired;
  }

  async clearResetToken(userId: number): Promise<boolean> {
    const { error } = await supabase
      .from('users')
      .update({ resetToken: null, resetTokenExpiry: null })
      .eq('id', userId);
    
    if (error) throw error;
    return true;
  }

  async getCalls(userId: number): Promise<Call[]> {
    const { data, error } = await supabase
      .from('calls')
      .select('*')
      .eq('userId', userId)
      .order('timestamp', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  async getCallStats(userId: number): Promise<{
    totalCalls: number;
    appointmentsBooked: number;
    avgDuration: string;
    avgRating: number;
    callToAppointmentRate: number;
    missedCallsPercentage: number;
    weeklyCallVolume: { day: string; calls: number }[];
    topPerformingDay: string;
    peakCallHours: string;
  }> {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - 7);

    const { data: recentCalls, error } = await supabase
      .from('calls')
      .select('*')
      .eq('userId', userId)
      .gte('timestamp', weekStart.toISOString());
    
    if (error) throw error;

    const totalCalls = recentCalls.length;
    const appointmentsBooked = recentCalls.filter(call => call.appointmentBooked).length;

    const totalDuration = recentCalls.reduce(
      (sum, call) => sum + (call.durationSeconds || 0),
      0
    );
    const avgDurationSeconds = totalCalls > 0 ? Math.round(totalDuration / totalCalls) : 0;
    const avgDurationMinutes = Math.floor(avgDurationSeconds / 60);
    const avgDurationRemainingSeconds = avgDurationSeconds % 60;
    const avgDuration = `${avgDurationMinutes}:${avgDurationRemainingSeconds
      .toString()
      .padStart(2, "0")}`;

    const totalRating = recentCalls.reduce(
      (sum, call) => sum + (call.rating || 0),
      0
    );
    const avgRating = totalCalls > 0 ? parseFloat((totalRating / totalCalls).toFixed(1)) : 0;

    const callToAppointmentRate =
      totalCalls > 0
        ? parseFloat(((appointmentsBooked / totalCalls) * 100).toFixed(1))
        : 0;

    // Calculate weekly call volume
    const weeklyCallVolume = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      const calls = recentCalls.filter(call => {
        const callDate = new Date(call.timestamp);
        return callDate.toDateString() === date.toDateString();
      }).length;
      return { day: dayName, calls };
    }).reverse();

    // Find top performing day
    const topPerformingDay = weeklyCallVolume.reduce((max, current) => 
      current.calls > max.calls ? current : max
    ).day;

    // Find peak call hours
    const hourCounts = Array(24).fill(0);
    recentCalls.forEach(call => {
      const hour = new Date(call.timestamp).getHours();
      hourCounts[hour]++;
    });
    const peakHour = hourCounts.indexOf(Math.max(...hourCounts));
    const peakCallHours = `${peakHour}:00`;

    return {
      totalCalls,
      appointmentsBooked,
      avgDuration,
      avgRating,
      callToAppointmentRate,
      missedCallsPercentage: 8.2, // Keeping this as is for now
      weeklyCallVolume,
      topPerformingDay,
      peakCallHours,
    };
  }

  async seedDemoData(): Promise<void> {
    // Check if we already have users
    const { data: existingUsers, error: checkError } = await supabase
      .from('users')
      .select('*');
    
    if (checkError) throw checkError;
    if (existingUsers.length > 0) {
      console.log("Demo data already exists, skipping seeding");
      return;
    }

    console.log("Seeding demo data...");

    // Create demo users
    const demoUsers: InsertUser[] = [
      {
        email: "johnadeyo@hotmail.com",
        password: "$2b$10$9KgvmhK5QnE9KrJO2hXjNuIVm2IAp6qARTcB/9O3Nmc56L8Z0RnMy", // "Password" hashed with bcrypt
        name: "John Adeyo",
        agencyName: "Golden Gate Properties",
      },
      {
        email: "serenaai862@gmail.com",
        password: "$2b$10$9KgvmhK5QnE9KrJO2hXjNuIVm2IAp6qARTcB/9O3Nmc56L8Z0RnMy", // "Password" hashed with bcrypt
        name: "Sarah Chen",
        agencyName: "Serena AI Demo Agency",
      },
    ];

    const createdUsers: User[] = [];
    for (const userData of demoUsers) {
      const { data: user, error } = await supabase
        .from('users')
        .insert(userData)
        .select()
        .single();
      
      if (error) throw error;
      createdUsers.push(user);
    }

    // Generate sample call data
    const callTypes = ["inbound", "outbound"];
    const now = new Date();

    // Generate calls for user 1
    for (let i = 0; i < 143; i++) {
      const day = Math.floor(Math.random() * 7);
      const callDate = new Date(now);
      callDate.setDate(now.getDate() - day);
      callDate.setHours(
        Math.floor(Math.random() * 24),
        Math.floor(Math.random() * 60)
      );

      const durationSeconds = Math.floor(Math.random() * 600) + 60; // 1-10 minutes
      const appointmentBooked = Math.random() > 0.6; // 40% chance of booking
      const rating = Math.floor(Math.random() * 5) + 1; // 1-5 rating

      const { error } = await supabase
        .from('calls')
        .insert({
          userId: createdUsers[0].id,
          phoneNumber: `(${Math.floor(Math.random() * 900) + 100}) 555-${
            Math.floor(Math.random() * 9000) + 1000
          }`,
          durationSeconds,
          callType: callTypes[Math.floor(Math.random() * callTypes.length)],
          appointmentBooked,
          rating,
          timestamp: callDate,
        });
      
      if (error) throw error;
    }

    // Generate calls for user 2
    for (let i = 0; i < 98; i++) {
      const day = Math.floor(Math.random() * 7);
      const callDate = new Date(now);
      callDate.setDate(now.getDate() - day);
      callDate.setHours(
        Math.floor(Math.random() * 24),
        Math.floor(Math.random() * 60)
      );

      const durationSeconds = Math.floor(Math.random() * 600) + 60; // 1-10 minutes
      const appointmentBooked = Math.random() > 0.7; // 30% chance of booking
      const rating = Math.floor(Math.random() * 5) + 1; // 1-5 rating

      const { error } = await supabase
        .from('calls')
        .insert({
          userId: createdUsers[1].id,
          phoneNumber: `(${Math.floor(Math.random() * 900) + 100}) 555-${
            Math.floor(Math.random() * 9000) + 1000
          }`,
          durationSeconds,
          callType: callTypes[Math.floor(Math.random() * callTypes.length)],
          appointmentBooked,
          rating,
          timestamp: callDate,
        });
      
      if (error) throw error;
    }

    console.log("Demo data seeded successfully");
  }
}

// Switch from memory storage to database storage
export const storage = new DatabaseStorage();
