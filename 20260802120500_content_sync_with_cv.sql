/*
# Sync project content with the CV sent to Alumex PLC

## Overview
Reconciles the Projects page sub-project cards with what's actually documented
in the owner's CV, so the site and the CV describe the same work.

## Changes
- Added four Mechanical & CAD sub-projects that were in the CV but missing
  from the site: Plastic Injection Molding Machine, Bucket Conveyor System,
  Tomato Sorting Machine, Single Storey Council Architectural Drawing.
- Renamed "Industrial Drying Oven" to "Industrial Oven for Drying Coconut
  Dust" and updated its description to match the CV wording.
- Removed three sub-projects that had no basis in the CV and were confirmed
  by the owner to be unverified placeholder content: "Precision XYZ
  Translation Stages", "CNC Tooling Dashboard", "X-Bar/R Control Chart
  System".
*/

-- (Data-only changes; already applied directly against the live database.
--  This file documents the change for schema history purposes.)
