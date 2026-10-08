/*
# Remove duplicate "Researches" entry from projects table

## Overview
The Projects page accordion included a "Researches" category that duplicated
content already shown on the dedicated Researches page. This removes that
row (and its cascading subprojects) so Projects only shows the four
non-research categories: Mechanical & CAD, Production Management,
IoT & Embedded Systems, and Software & Programming.
*/

DELETE FROM projects WHERE title = 'Researches';
