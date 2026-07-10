data "google_project" "current" {
  project_id = var.project_id
}

resource "google_secret_manager_secret" "runtime" {
  for_each  = var.runtime_secret_ids
  secret_id = each.value
  replication {
    auto {}
  }
  depends_on = [google_project_service.required]
}

resource "google_secret_manager_secret_iam_member" "runtime_access" {
  for_each  = google_secret_manager_secret.runtime
  project   = var.project_id
  secret_id = each.value.secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.runtime.email}"
}

resource "google_project_iam_member" "runtime_service_usage" {
  project = var.project_id
  role    = "roles/serviceusage.serviceUsageConsumer"
  member  = "serviceAccount:${google_service_account.runtime.email}"
}

resource "google_storage_bucket_iam_member" "private_media_runtime" {
  bucket = google_storage_bucket.private_media.name
  role   = "roles/storage.objectUser"
  member = "serviceAccount:${google_service_account.runtime.email}"
}

resource "google_storage_bucket_iam_member" "public_assets_runtime" {
  bucket = google_storage_bucket.public_assets.name
  role   = "roles/storage.objectUser"
  member = "serviceAccount:${google_service_account.runtime.email}"
}

resource "google_pubsub_topic_iam_member" "runtime_publisher" {
  topic  = google_pubsub_topic.events.name
  role   = "roles/pubsub.publisher"
  member = "serviceAccount:${google_service_account.runtime.email}"
}

resource "google_project_iam_member" "runtime_task_enqueuer" {
  project = var.project_id
  role    = "roles/cloudtasks.enqueuer"
  member  = "serviceAccount:${google_service_account.runtime.email}"
}

resource "google_service_account" "deploy" {
  count        = var.enable_github_oidc ? 1 : 0
  account_id   = "acoolcollector-deploy"
  display_name = "ACoolCOLLECTOR GitHub deployment"
}

resource "google_iam_workload_identity_pool" "github" {
  count                     = var.enable_github_oidc ? 1 : 0
  workload_identity_pool_id = "acoolcollector-github"
  display_name              = "ACoolCOLLECTOR GitHub"
}

resource "google_iam_workload_identity_pool_provider" "github" {
  count                              = var.enable_github_oidc ? 1 : 0
  workload_identity_pool_id          = google_iam_workload_identity_pool.github[0].workload_identity_pool_id
  workload_identity_pool_provider_id = "github"
  display_name                       = "GitHub Actions"
  attribute_mapping = {
    "google.subject"             = "assertion.sub"
    "attribute.repository"       = "assertion.repository"
    "attribute.ref"              = "assertion.ref"
    "attribute.repository_owner" = "assertion.repository_owner"
  }
  attribute_condition = "assertion.repository == '${var.github_repository}'"
  oidc {
    issuer_uri = "https://token.actions.githubusercontent.com"
  }
}

resource "google_service_account_iam_member" "github_workload_identity" {
  count              = var.enable_github_oidc ? 1 : 0
  service_account_id = google_service_account.deploy[0].name
  role               = "roles/iam.workloadIdentityUser"
  member             = "principalSet://iam.googleapis.com/${google_iam_workload_identity_pool.github[0].name}/attribute.repository/${var.github_repository}"
}

locals {
  deploy_roles = toset([
    "roles/artifactregistry.writer",
    "roles/run.admin",
    "roles/iam.serviceAccountUser",
    "roles/serviceusage.serviceUsageAdmin",
    "roles/secretmanager.admin",
    "roles/storage.admin",
    "roles/pubsub.admin",
    "roles/cloudtasks.admin"
  ])
}

resource "google_project_iam_member" "deploy" {
  for_each = var.enable_github_oidc ? local.deploy_roles : toset([])
  project  = var.project_id
  role     = each.value
  member   = "serviceAccount:${google_service_account.deploy[0].email}"
}
