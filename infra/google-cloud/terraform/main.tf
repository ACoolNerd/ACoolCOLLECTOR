terraform {
  required_version = ">= 1.6.0"

  backend "gcs" {}

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = ">= 5.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

locals {
  services = toset([
    "run.googleapis.com",
    "artifactregistry.googleapis.com",
    "cloudbuild.googleapis.com",
    "secretmanager.googleapis.com",
    "cloudkms.googleapis.com",
    "storage.googleapis.com",
    "pubsub.googleapis.com",
    "cloudtasks.googleapis.com",
    "vision.googleapis.com",
    "texttospeech.googleapis.com",
    "aiplatform.googleapis.com",
    "logging.googleapis.com",
    "monitoring.googleapis.com",
    "billingbudgets.googleapis.com",
    "cloudresourcemanager.googleapis.com",
    "iamcredentials.googleapis.com",
    "sts.googleapis.com"
  ])
}

resource "google_project_service" "required" {
  for_each           = local.services
  service            = each.value
  disable_on_destroy = false
}

resource "google_artifact_registry_repository" "containers" {
  location      = var.region
  repository_id = "acoolcollector"
  format        = "DOCKER"
  depends_on    = [google_project_service.required]
}

resource "google_service_account" "runtime" {
  account_id   = "acoolcollector-runtime"
  display_name = "ACoolCOLLECTOR runtime"
}

resource "google_storage_bucket" "private_media" {
  name                        = "${var.project_id}-acool-private-media"
  location                    = var.region
  uniform_bucket_level_access = true
  public_access_prevention    = "enforced"

  versioning {
    enabled = true
  }
}

resource "google_storage_bucket" "public_assets" {
  name                        = "${var.project_id}-acool-public-assets"
  location                    = var.region
  uniform_bucket_level_access = true
  public_access_prevention    = "enforced"

  versioning {
    enabled = true
  }
}

resource "google_pubsub_topic" "events" {
  name       = "acoolcollector-events"
  depends_on = [google_project_service.required]
}

resource "google_cloud_tasks_queue" "work" {
  name     = "acoolcollector-work"
  location = var.region

  rate_limits {
    max_dispatches_per_second = 5
    max_concurrent_dispatches = 10
  }

  retry_config {
    max_attempts  = 8
    min_backoff   = "5s"
    max_backoff   = "300s"
    max_doublings = 5
  }

  depends_on = [google_project_service.required]
}

resource "google_cloud_run_v2_service" "api" {
  name     = "acoolcollector-api"
  location = var.region
  ingress  = "INGRESS_TRAFFIC_ALL"

  template {
    service_account = google_service_account.runtime.email
    timeout         = "60s"

    scaling {
      min_instance_count = var.min_instances
      max_instance_count = var.max_instances
    }

    containers {
      image = var.container_image

      ports {
        container_port = 8080
      }

      resources {
        limits = {
          cpu    = "1"
          memory = "1Gi"
        }
      }

      env {
        name  = "NODE_ENV"
        value = "production"
      }

      env {
        name  = "PORT"
        value = "8080"
      }

      env {
        name  = "PUBLIC_SITE_URL"
        value = var.public_site_url
      }

      env {
        name  = "ALLOWED_ORIGINS"
        value = join(",", var.allowed_origins)
      }

      startup_probe {
        http_get {
          path = "/health"
          port = 8080
        }

        initial_delay_seconds = 5
        period_seconds        = 10
        failure_threshold     = 12
      }

      liveness_probe {
        http_get {
          path = "/health"
          port = 8080
        }

        period_seconds    = 30
        failure_threshold = 3
      }
    }
  }

  depends_on = [google_project_service.required]
}

resource "google_cloud_run_v2_service_iam_member" "public" {
  count    = var.allow_unauthenticated ? 1 : 0
  name     = google_cloud_run_v2_service.api.name
  location = google_cloud_run_v2_service.api.location
  role     = "roles/run.invoker"
  member   = "allUsers"
}
