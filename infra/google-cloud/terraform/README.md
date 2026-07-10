# ACoolCOLLECTOR Google Cloud Deployment

This Terraform package raises repository deployment readiness by defining the production foundation for the ACoolOMNI API.

## Provisioned resources

- required Google Cloud APIs;
- Artifact Registry Docker repository;
- dedicated Cloud Run runtime service account;
- Cloud Run v2 service;
- private media bucket with public-access prevention;
- public asset bucket with public-access prevention until reviewed delivery is configured;
- Pub/Sub event topic;
- rate-limited Cloud Tasks queue;
- health probes, scaling limits, explicit origins, and immutable container-image input.

## Required external setup

Terraform does not create billing, domain ownership, OAuth consent, Intuit approval, provider agreements, or production secret values.

1. Create separate development and production Google Cloud projects.
2. Attach billing and configure budgets and alerts.
3. Authenticate Terraform using an approved administrator identity.
4. Build the image from `src/omni-engine/Dockerfile` and push it to Artifact Registry.
5. Supply an immutable image reference in `container_image`.
6. Apply Terraform first in development.
7. Add secret versions through Secret Manager without placing values in Terraform state.
8. Grant only the minimum secret, storage, task, Pub/Sub, Vision, Text-to-Speech, logging, and monitoring permissions required by the runtime service account.
9. Run migration, RLS, OAuth, QuickBooks sandbox, AI, accessibility, and security acceptance suites.
10. Promote the same reviewed artifact to production.

## Commands

```bash
terraform init
terraform fmt -check
terraform validate
terraform plan -out=plan.tfplan
terraform apply plan.tfplan
```

## Release boundary

A successful Terraform apply means infrastructure exists. It does not mean QuickBooks, Maps, People, grading companies, retailers, events, or affiliate programs have approved ACoolCOLLECTOR.
