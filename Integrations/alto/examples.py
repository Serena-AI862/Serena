from datetime import datetime, timedelta
from client import AltoClient
import os

def main():
    # Initialize client with sandbox mode
    client = AltoClient(
        api_key=os.getenv("ALTO_API_KEY"),
        sandbox=True
    )

    # Example 1: Create a contact and property, then book an appointment
    print("Creating contact, property, and appointment...")
    
    # Create contact
    contact_data = {
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@example.com",
        "phone": "+44123456789"
    }
    contact = client.create_contact(contact_data)
    contact_id = contact["id"]
    
    # Create property with owner association
    property_data = {
        "address": "123 Main St",
        "city": "London",
        "postcode": "SW1A 1AA",
        "ownerId": contact_id  # Associate the contact as the owner
    }
    property_info = client.create_property(property_data)
    property_id = property_info["id"]
    
    # Create appointment
    appointment_data = {
        "type": "Market Appraisal",
        "date": (datetime.now() + timedelta(days=1)).isoformat(),
        "duration": 60,  # minutes
        "propertyId": property_id,
        "attendeeId": contact_id
    }
    appointment = client.create_appointment(appointment_data)
    print(f"Created appointment: {appointment}")

    # Example 2: Handle reference checks
    print("\nHandling reference checks...")
    
    # Get recent reference checks
    start_date = datetime.now() - timedelta(days=7)
    reference_checks = client.get_reference_checks(start_date=start_date)
    
    for check in reference_checks:
        # Get tenant information
        tenancy_id = check["tenancyId"]
        tenant_ids = client.get_tenancy_tenant_ids(tenancy_id)
        
        for tenant_id in tenant_ids:
            # Get tenant details
            tenant = client.get_contact(tenant_id)
            print(f"Processing reference check for tenant: {tenant['firstName']} {tenant['lastName']}")
            
            # Get guarantor information
            guarantor_ids = client.get_guarantor_ids(tenant_id)
            for guarantor_id in guarantor_ids:
                guarantor = client.get_contact(guarantor_id)
                print(f"Found guarantor: {guarantor['firstName']} {guarantor['lastName']}")
            
            # Upload reference check document
            document_path = "reference_check.pdf"  # Example document
            if os.path.exists(document_path):
                client.upload_document(
                    document_path=document_path,
                    linked_type="Contact",
                    linked_id=tenant_id
                )
                print(f"Uploaded reference check document for tenant {tenant_id}")
            
            # Update reference check status
            client.update_reference_check_status(
                reference_check_id=check["id"],
                status="Completed"
            )
            print(f"Updated reference check status to Completed")

if __name__ == "__main__":
    main() 