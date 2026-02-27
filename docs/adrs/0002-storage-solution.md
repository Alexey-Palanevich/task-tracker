# ADR-0002: Storage Solution Selection

Status: **Proposed**  
Date: 2026-02-27

## Context

Task Tracker requires file storage for:
- Task attachments (images, documents)
- User avatars
- Export files
- Potentially future plugin data

We need an S3-compatible storage solution that:
- Works with our Docker-based deployment (NFR-6.3, NFR-6.6)
- Is self-hostable on a single VPS
- Has active community/maintenance
- Provides reasonable performance for small-medium deployments

**Critical finding**: MinIO (the most popular S3-compatible solution) entered maintenance mode in December 2025 and was archived in February 2026. The open-source community version is no longer actively maintained.

## Decision

**To be determined** - this ADR presents alternatives for team decision.

## Alternatives Considered

### Option 1: SeaweedFS

| Aspect | Details |
|--------|---------|
| **Description** | Distributed object store with master-volume architecture |
| **License** | Apache 2.0 (core) + optional enterprise license |
| **Performance** | 2.3 GB/s read, 1.8 GB/s write; best small-object latency (2.1ms) |
| **S3 Compatibility** | 56 passed tests - missing versioning, lifecycle, STS, CORS |
| **Resource Needs** | 2-4 GB RAM per volume server |
| **Deployment** | Single binary, Docker, or Kubernetes |
| **Production History** | 10+ years, billions of files proven |
| **Maintenance** | Active (10,900 commits) |

**Pros:**
- Most popular MinIO alternative
- Excellent performance for small files
- Simple single-node deployment
- Apache 2.0 license (no AGPL restrictions)

**Cons:**
- Missing some S3 features (versioning, lifecycle)
- Weaker UI compared to MinIO
- Higher operational complexity than filesystem

---

### Option 2: Local Filesystem

| Aspect | Details |
|--------|---------|
| **Description** | Direct filesystem storage via NestJS serve-static |
| **License** | N/A |
| **Performance** | Native - fastest possible |
| **S3 Compatibility** | None |
| **Resource Needs** | Minimal |
| **Deployment** | Docker volume mount |
| **Production History** | Universal |
| **Maintenance** | N/A |

**Pros:**
- Simplest possible solution
- No additional service to maintain
- Fastest performance (no network overhead)
- No S3 API overhead if not needed

**Cons:**
- No S3 compatibility
- Difficult to scale horizontally
- No built-in redundancy
- No object versioning/lifecycle

---

### Option 3: Ceph RGW (via Rook)

| Aspect | Details |
|--------|---------|
| **Description | Unified storage platform (block, object, file) |
| **License** | LGPL 2.1 |
| **Performance** | 1.9 GB/s read, 1.4 GB/s write (6.3ms latency) |
| **S3 Compatibility** | 576 passed tests - best S3 API coverage |
| **Resource Needs** | 8-16 GB RAM per OSD, dedicated SSDs |
| **Deployment** | Requires Rook operator, 3+ nodes recommended |
| **Production History** | 10+ years, exascale proven |
| **Maintenance** | Active |

**Pros:**
- Best S3 API compatibility
- Battle-tested enterprise reliability
- Advanced placement policies, tiered storage

**Cons:**
- Complex setup (requires Rook + Kubernetes)
- Requires 3+ nodes for production
- Overkill for single-VPS deployment
- High resource requirements

---

### Option 4: Garage

| Aspect | Details |
|--------|---------|
| **Description** | Lightweight Rust-based object storage |
| **License** | AGPLv3 |
| **Performance** | Moderate |
| **S3 Compatibility** | Partial |
| **Resource Needs** | 1-2 GB RAM (minimal) |
| **Deployment** | Single binary or Docker |
| **Production History** | Active development, 2025 NLnet funding |
| **Maintenance** | Active |

**Pros:**
- Minimal resource requirements
- Designed for self-hosting
- Geo-distributed replication

**Cons:**
- AGPLv3 license implications
- Less production proof than SeaweedFS
- S3 feature completeness gaps

---

### Option 5: RustFS

| Aspect | Details |
|--------|---------|
| **Description** | Rust-based high-performance S3 implementation |
| **License** | Apache 2.0 |
| **Performance** | Claims 2.3x faster than MinIO (unverified) |
| **S3 Compatibility** | Unknown - beta status |
| **Resource Needs** | Low |
| **Deployment** | Docker |
| **Production History** | ~2,000 commits over 2 years |
| **Maintenance** | Beta - risky for production |

**Pros:**
- Pure Apache 2.0 license
- High performance claims

**Cons:**
- Beta status - no production proof
- Limited community
- S3 API completeness untested

---

## Comparison Matrix

| Criteria | SeaweedFS | Filesystem | Ceph RGW | Garage | RustFS |
|----------|-----------|------------|----------|--------|--------|
| S3 Compatibility | Partial | None | Full | Partial | Unknown |
| Single VPS Deploy | Yes | Yes | No | Yes | Yes |
| License | Apache 2.0 | N/A | LGPL | AGPL | Apache 2.0 |
| Active Maintenance | Yes | N/A | Yes | Yes | Beta |
| Resource Efficiency | Good | Best | Poor | Best | Good |
| Production Proven | Yes | Yes | Yes | Moderate | No |
| Setup Complexity | Low | Lowest | High | Low | Low |

## Recommendation

For Task Tracker (single-VPS self-hosted deployment):

1. **Recommended for MVP**: **Local Filesystem** - Simplest solution, no S3 features needed for initial release
2. **Recommended for future**: **SeaweedFS** - When S3 API needed, best balance of features and simplicity

Ceph RGW is excluded due to multi-node requirement. Garage and RustFS are less proven than SeaweedFS.

## Consequences

### If using Local Filesystem

**Positive:**
- Simplest deployment
- Fastest performance
- No additional maintenance burden

**Negative:**
- No S3 compatibility for future integrations
- Harder to scale horizontally
- No built-in backup/versioning

### If using SeaweedFS

**Positive:**
- S3 API available for future needs
- Proven at scale
- Apache 2.0 license friendly

**Negative:**
- Additional service to maintain
- Missing some S3 features
- Slightly more complex setup

## Related

- NFR-6: Deployment requirements
- ADR-0001: Tech Stack Selection
