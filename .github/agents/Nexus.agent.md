# Next.js Full-Stack Developer Configuration

## Complete Tool Suite and Verification Protocols

```yaml
description: "Next.js Full-Stack Developer with Comprehensive Verification Protocols"

tools:
  # Core development
  - read
  - edit
  - search
  - execute
  - file_watch
  - directory_sync

  # Code quality & formatting
  - lint
  - eslint_fix
  - prettier_format
  - typecheck
  - sonarqube

  # Testing suite
  - test
  - test_watch
  - test_coverage
  - e2e_test
  - api_test
  - load_test
  - cypress
  - jest
  - playwright

  # Build & optimization
  - build
  - bundle_analyze
  - image_optimize
  - asset_compress
  - webpack_analyze

  # Verification
  - verify
  - lighthouse
  - web_vitals
  - accessibility_check

  # Web access & APIs
  - web
  - npm_registry
  - api_reference
  - docs_lookup
  - graphql_playground

  # Version control
  - git
  - git_hooks
  - git_flow
  - conventional_commits

  # Next.js ecosystem
  - next_dev
  - next_build
  - next_lint
  - next_export
  - next_start
  - next_telemetry

  # Package management
  - npm_install
  - npm_audit
  - npm_update
  - yarn
  - pnpm
  - dependency_check
  - security_audit
  - license_check

  # Database & ORM
  - db_migrate
  - db_seed
  - db_query
  - db_backup
  - db_restore
  - prisma_generate
  - prisma_studio
  - prisma_migrate
  - typeorm
  - mongoose

  # Deployment & Infrastructure
  - vercel_deploy
  - netlify_deploy
  - aws_deploy
  - deploy_preview
  - docker_build
  - docker_compose
  - docker_run
  - kubernetes
  - env_validate
  - environment_sync
  - cdn_purge

  # Process management
  - pm2
  - systemctl
  - container_logs
  - port_check
  - memory_profile
  - cpu_profile

  # Monitoring & Analytics
  - sentry
  - datadog
  - new_relic
  - google_analytics
  - mixpanel
  - hotjar

  # Communication & Documentation
  - slack_notify
  - discord_notify
  - email_notify
  - jira_integration
  - confluence
  - notion
  - swagger_generate
  - storybook

  # File operations
  - file_upload
  - file_download
  - image_resize
  - pdf_generate
  - csv_parse
  - json_validate
  - xml_parse

  # External services
  - stripe_api
  - paypal_api
  - sendgrid
  - twilio
  - auth0
  - firebase
  - supabase
  - planetscale

# Enhanced verification protocols
verification:
  required_after_changes: true
  commands:
    - "lint"
    - "typecheck"
    - "test"
    - "security_audit"
    - "build"
    - "lighthouse"
    - "accessibility_check"
  fail_fast: true
  parallel_execution: true
  cache_results: true
  timeout: 300 # seconds
  retry_on_failure: 2

# Performance thresholds
performance_gates:
  lighthouse_performance: 90
  lighthouse_accessibility: 95
  lighthouse_best_practices: 90
  lighthouse_seo: 90
  bundle_size_limit: "250KB"
  first_contentful_paint: "1.5s"
  largest_contentful_paint: "2.5s"
  time_to_interactive: "3.8s"
  cumulative_layout_shift: 0.1
  first_input_delay: "100ms"

# Security protocols
security:
  auto_audit: true
  block_vulnerable_deps: true
  require_security_review: true
  scan_secrets: true
  dependency_scanning: true
  static_analysis: true
  container_scanning: true
  license_compliance: true
  vulnerability_threshold: "medium"

# Code quality standards
code_quality:
  eslint_config: "@next/eslint-config-next"
  prettier_config: ".prettierrc"
  typescript_strict: true
  test_coverage_threshold: 80
  complexity_threshold: 10
  maintainability_index: 70
  duplication_threshold: 5

# Version management
version_check:
  auto_check: true
  major_version_threshold: 2
  require_approval: true
  compatibility_check: true
  breaking_change_detection: true
  changelog_generation: true

# Environment management
environments:
  - name: "development"
    url: "http://localhost:3000"
    database: "dev"
  - name: "staging"
    url: "https://staging.example.com"
    database: "staging"
  - name: "production"
    url: "https://example.com"
    database: "production"

environment_config:
  validate_before_deploy: true
  sync_env_vars: true
  require_env_approval: true
  backup_before_change: true

# Database configuration
database:
  providers:
    - postgresql
    - mysql
    - mongodb
    - sqlite
  connection_pooling: true
  migration_strategy: "incremental"
  backup_schedule: "daily"
  performance_monitoring: true

# API configuration
api:
  rate_limiting: true
  authentication: "jwt"
  cors_enabled: true
  swagger_docs: true
  api_versioning: true
  request_validation: true
  response_caching: true

# Documentation sources (in order of authority)
documentation_sources:
  - nextjs.org/docs
  - react.dev
  - typescriptlang.org/docs
  - npmjs.com
  - prisma.io/docs
  - vercel.com/docs
  - developer.mozilla.org
  - github.com/vercel/next.js
  - stackoverflow.com
  - dev.to

# Error handling & recovery
error_handling:
  max_attempts: 3
  require_fix_before_continue: true
  auto_rollback: true
  error_reporting: true
  error_tracking: "sentry"
  alert_threshold: "error"
  recovery_strategies:
    - "retry"
    - "fallback"
    - "circuit_breaker"

# Workflow automation
workflows:
  pre_commit:
    - lint
    - prettier_format
    - typecheck
    - test

  pre_push:
    - build
    - security_audit
    - test_coverage

  pre_deploy:
    - lighthouse
    - load_test
    - env_validate
    - db_migrate

  post_deploy:
    - smoke_test
    - performance_check
    - error_monitoring
    - slack_notify

# Notification settings
notifications:
  channels:
    - slack
    - email
    - discord
  events:
    - deployment_success
    - deployment_failure
    - security_alert
    - performance_degradation
    - error_threshold_exceeded
  escalation_rules:
    - level: "warning"
      wait_time: "15m"
    - level: "critical"
      immediate: true

# Caching strategy
caching:
  build_cache: true
  dependency_cache: true
  test_cache: true
  image_cache: true
  cdn_cache: true
  database_cache: true
  redis_cache: true

# Logging configuration
logging:
  level: "info"
  format: "json"
  rotation: "daily"
  retention: "30d"
  structured: true
  correlation_id: true
  sensitive_data_masking: true

# Feature flags
feature_flags:
  provider: "vercel"
  environment_specific: true
  percentage_rollout: true
  user_targeting: true
  a_b_testing: true

# Analytics and monitoring
analytics:
  page_views: true
  user_sessions: true
  conversion_tracking: true
  error_tracking: true
  performance_monitoring: true
  real_user_monitoring: true
  synthetic_monitoring: true

# Backup and disaster recovery
backup:
  database_backup: "daily"
  code_backup: "continuous"
  asset_backup: "weekly"
  configuration_backup: "on_change"
  backup_retention: "90d"
  disaster_recovery_plan: true
  recovery_time_objective: "4h"
  recovery_point_objective: "1h"

# Compliance and governance
compliance:
  gdpr: true
  ccpa: true
  sox: false
  pci_dss: false
  accessibility: "wcag_aa"
  data_retention_policy: true
  audit_logging: true
  change_management: true

# Development best practices
best_practices:
  atomic_commits: true
  branch_naming_convention: "feature/ticket-description"
  pull_request_template: true
  code_review_required: true
  minimum_reviewers: 2
  automated_testing: true
  documentation_required: true
  changelog_updates: true
```

## Usage Examples

### Basic Development Workflow

```bash
# Start development
next_dev

# Make changes and verify
lint && typecheck && test

# Build and deploy
build && deploy_preview
```

### Security-First Workflow

```bash
# Security check before commit
security_audit && dependency_check && scan_secrets

# Full security verification
verify --security-only
```

### Performance Optimization

```bash
# Analyze bundle size
bundle_analyze

# Run performance tests
lighthouse && web_vitals && load_test

# Optimize assets
image_optimize && asset_compress
```

### Database Operations

```bash
# Setup database
db_migrate && db_seed

# Development workflow
prisma_generate && prisma_studio
```

## Integration Points

- **CI/CD Pipelines**: GitHub Actions, GitLab CI, Jenkins
- **Cloud Platforms**: Vercel, Netlify, AWS, Azure, GCP
- **Monitoring**: Sentry, DataDog, New Relic
- **Databases**: PostgreSQL, MySQL, MongoDB, Supabase
- **Authentication**: Auth0, Firebase, NextAuth.js
- **Payment**: Stripe, PayPal
- **Communication**: Slack, Discord, Email

## Customization Notes

This configuration can be customized based on:

- Project size and complexity
- Team size and experience
- Deployment requirements
- Security and compliance needs
- Performance requirements
- Budget constraints
