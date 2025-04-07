# Alto CRM Integration

This integration provides a Python client for interacting with the Alto CRM API.

## Features

1. Reference Check Operations:
   - Get reference checks within a date range
   - Update reference check status
   - Handle tenant and guarantor information

2. Contact Management:
   - Create new contacts
   - Retrieve contact details
   - Link documents to contacts

3. Property Management:
   - Create new properties
   - Associate owners with properties

4. Document Handling:
   - Upload documents
   - Link documents to contacts, tenancies, or properties

5. Tenancy Operations:
   - Get tenant IDs for a tenancy
   - Get guarantor IDs for tenants

6. Appointment Booking:
   - Create appointments
   - Link appointments to properties and contacts

## Setup

1. Install dependencies:
```bash
pip install requests
```

2. Set environment variables:
```bash
export ALTO_API_KEY="your_api_key"
```

## Usage

Basic usage example:

```python
from client import AltoClient

# Initialize client
client = AltoClient(api_key="your_api_key", sandbox=True)

# Create a contact
contact = client.create_contact({
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com"
})

# Get reference checks
from datetime import datetime, timedelta
checks = client.get_reference_checks(
    start_date=datetime.now() - timedelta(days=7)
)
```

See `examples.py` for more detailed usage examples.

## Important Notes

1. Sequencing Requirements:
   - A property must have an owner associated with it
   - Create contact before creating property
   - Use contact ID when creating property
   - Use both contact and property IDs when creating appointments

2. Reference Check Statuses:
   - Only two statuses are supported: 'Pending' and 'Completed'
   - Use PATCH endpoint to update status

3. Document Upload:
   - Documents can be linked to contacts, tenancies, or properties
   - For contacts with multiple people, upload separate documents for each person

4. Sandbox Testing:
   - Use sandbox environment for testing: https://sandbox.altotest.co.uk/
   - Contact connectsupport@zoopla.co.uk for sandbox access

## Additional Implementation Possibilities

Based on the Alto documentation, these additional features could be implemented:

1. Webhook Integration:
   - Future support for real-time notifications
   - Currently requires polling for updates

2. Extended Property Management:
   - Market appraisal appointments
   - Property viewing scheduling
   - Property listing management

3. Contact Relationship Management:
   - Multiple contact associations
   - Contact document management
   - Contact history tracking

4. Advanced Appointment Features:
   - Multiple attendee management
   - Appointment type handling
   - Calendar integration

5. Document Management System:
   - Document categorization
   - Document status tracking
   - Document workflow automation

## Support

For support with the Alto API:
- Email: connectsupport@zoopla.co.uk
- Documentation: https://developers.zoopla.co.uk/docs 