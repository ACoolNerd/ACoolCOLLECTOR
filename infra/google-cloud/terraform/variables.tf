variable "project_id" {
  description = "Dedicated Google Cloud project ID for the target environment."
  type        = string
}

variable "region" {
  description = "Primary Google Cloud region."
  type        = string
  default     = "us-central1"
}

variable "environment" {
  description = "Deployment environment label."
  type        = string
  default     = "development"
  validation {
    condition     = contains(["development", "staging", "production"], var.environment)
    error_message = "environment must be development, staging, or production."
  }
}

variable "container_image" {
  description = "Immutable Artifact Registry image URI including digest or version tag."
  type        = string
}

variable "public_site_url" {
  description = "Canonical HTTPS public site URL."
  type        = string
  validation {
    condition     = startswith(var.public_site_url, "https://")
    error_message = "public_site_url must use HTTPS."
  }
}

variable "allowed_origins" {
  description = "Explicit browser origins allowed by the API."
  type        = list(string)
  default     = []
}

variable "min_instances" {
  type    = number
  default = 0
}

variable "max_instances" {
  type    = number
  default = 10
}

variable "allow_unauthenticated" {
  description = "Allow public Cloud Run invocation. Application routes still enforce IAM where required."
  type        = bool
  default     = true
}

variable "runtime_secret_ids" {
  description = "Secret Manager secret IDs created without secret values."
  type        = set(string)
  default = [
    "sportscardspro-api-token",
    "supabase-service-role-key",
    "intuit-client-id",
    "intuit-client-secret",
    "intuit-webhook-verifier-token"
  ]
}

variable "enable_github_oidc" {
  description = "Create a GitHub Actions Workload Identity Federation provider."
  type        = bool
  default     = false
}

variable "github_repository" {
  description = "GitHub repository allowed to use the deployment identity."
  type        = string
  default     = "ACoolNerd/ACoolCOLLECTOR"
}

variable "github_branch" {
  description = "GitHub branch allowed to deploy production."
  type        = string
  default     = "main"
}

variable "alert_email" {
  description = "Optional email address for monitoring notifications."
  type        = string
  default     = ""
}
