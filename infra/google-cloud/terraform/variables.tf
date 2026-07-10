variable "project_id" {
  description = "Dedicated Google Cloud project ID for the target environment."
  type        = string
}

variable "region" {
  description = "Primary Google Cloud region."
  type        = string
  default     = "us-central1"
}

variable "container_image" {
  description = "Immutable Artifact Registry image URI including digest or version tag."
  type        = string
}

variable "public_site_url" {
  description = "Canonical HTTPS public site URL."
  type        = string
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
