# PaintFlow

PaintFlow is a modern paint retail and shop operations platform built for a real-world paint business use case. It combines a creative customer-facing storefront with an internal management dashboard for products, inventory, billing, customers, and reporting.

The goal of the project is to give paint shops a system that is both operationally useful and visually impressive:
- a premium storefront for browsing products and categories
- an admin panel for managing products, stock, invoices, and business data
- a scalable foundation for future features like tint/shade handling, bill exports, and paint visualization integration

---

## Overview

PaintFlow is being designed as two connected experiences:

### 1. Storefront
The public-facing website where customers can:
- explore paint products and categories
- browse brands
- request quotes
- experience a premium, motion-rich paint-focused UI

### 2. Admin Dashboard
The internal business system where the shop can:
- add and edit products
- manage stock and inventory
- create and track invoices
- manage customer data
- review reports and operational metrics

This structure allows the business to manage content and inventory internally while automatically reflecting selected product data on the storefront.

---

## Key Features

### Storefront
- premium landing page focused on color and material storytelling
- category browsing
- product listing and product detail pages
- featured products and brand sections
- quote request flow
- responsive UI across desktop, tablet, and mobile
- animation-first design direction using GSAP

### Admin
- product management
- inventory overview
- invoice management
- customer records
- reports dashboard
- settings area
- scalable structure for future auth and role-based access

### Planned / Future
- tintable product handling
- shade code and shade name support in billing
- GST-aware invoice workflow
- PDF/Excel exports
- file and bill attachment handling
- paint visualization software integration if supported
- advanced analytics and low-stock automation

---

## Tech Stack

### Frontend
- [Next.js](https://nextjs.org/)
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)

### UI / DX
- [shadcn/ui](https://ui.shadcn.com/)
- [Radix UI](https://www.radix-ui.com/)
- [Lucide Icons](https://lucide.dev/)
- [GSAP](https://gsap.com/)

### State / Forms / Validation
- Zustand
- React Hook Form
- Zod

### Data / Charts / Utilities
- Recharts
- date-fns
- clsx
- tailwind-merge

---

## Project Goals

This project is being built to satisfy both business and portfolio goals:

### Business goals
- make product and stock handling easier for the shop
- allow the owner/staff to manage products without developer involvement
- provide a foundation for billing and invoice workflows
- keep the storefront modern and customer-friendly

### Portfolio goals
- build a realistic business platform, not just a static website
- showcase full-stack product thinking
- combine strong UI design with business-system architecture
- create a storefront with premium motion and performance-conscious frontend engineering

---