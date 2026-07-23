# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Internal staff of a real estate developer, role-specific: sales/CRM reps handle leads and bookings, finance handles budgets and payments, procurement/inventory handle stock and vendors, HR handles employees, fleet handles vehicles, ops managers use tasks and overview across modules. Each role mostly works within its own module; admins/managers cross modules.

## Product Purpose

ABOS ("Enterprise OS") is the unified operating system for a real estate developer's back-office operations: booking & units, sales CRM, procurement, inventory, finance/budget, tasks, HR, and fleet. It exists to replace scattered spreadsheets with one system of record.

## Positioning

A single internal system of record tying booking-to-cash, budgets, procurement, HR, and fleet together for a real estate developer — where competitors are disconnected spreadsheets/point tools per department.

## Operating Context

Modules observed in the codebase: Booking & Units (incl. per-unit detail pages), Sales CRM (leads), Procurement, Inventory, Finance/Budget, Tasks, HR, Fleet. Left sidebar navigation, single-column content area, Next.js 14 + Tailwind + lucide-react icons.

## Capabilities and Constraints

Internal enterprise tool — data correctness and clarity over marketing polish. Multi-module dashboard app (Next.js App Router, Prisma/NestJS API backend per repo structure). Undecided: multi-tenant vs single-company deployment; user role/permission model.

## Brand Commitments

Product name "ABOS" (Enterprise OS) is fixed, used in page title and sidebar. No further brand assets (logo, color identity, typography) confirmed yet — current UI uses a neutral zinc/black-and-white palette as a placeholder, not a confirmed brand choice.

## Evidence on Hand

No real content, demos, or case studies on hand. Codebase provides only structural/module evidence (route names, DTOs, sidebar nav).

## Product Principles

1. One system of record beats N disconnected spreadsheets — every module should reduce, not add, cross-referencing effort.
2. Role-scoped clarity: each user should land in their module fast and not be forced through irrelevant modules.
3. Financial and operational data (budgets, bookings, inventory) must read as trustworthy and precise — this is back-office truth, not a public-facing surface.
4. Internal tool: prioritize task completion speed and information density appropriate for daily repeated use over persuasive/marketing design.

## Accessibility & Inclusion

No product-specific requirement established yet.
