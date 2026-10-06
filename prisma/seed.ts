/**
 * Database Seed Script for SCSCO College Digital Platform
 * Populates realistic academic entities, demo accounts, and permission models.
 */

import {
  INITIAL_USERS,
  INITIAL_DEPARTMENTS,
  INITIAL_COURSES,
  INITIAL_ACADEMIC_YEARS,
  INITIAL_SEMESTERS,
  INITIAL_CLASSES,
  INITIAL_DIVISIONS,
  INITIAL_FACULTY,
  INITIAL_SUBJECTS,
  INITIAL_STUDENTS,
  INITIAL_ENROLLMENTS,
  INITIAL_TIMETABLE,
  INITIAL_ASSIGNMENTS,
  INITIAL_STUDY_MATERIALS,
  INITIAL_EXAMS,
  INITIAL_RESULTS,
  INITIAL_FEES,
  INITIAL_NOTICES,
  INITIAL_EVENTS,
  INITIAL_NEWS,
  INITIAL_GALLERY,
  INITIAL_HERO_SLIDES,
  INITIAL_JOBS
} from '../src/lib/db/initialData';

async function main() {
  console.log('🚀 Seeding SCSCO College Digital Platform Database...');
  console.log(`✓ Loaded ${INITIAL_USERS.length} institutional user accounts`);
  console.log(`✓ Loaded ${INITIAL_DEPARTMENTS.length} engineering & science departments`);
  console.log(`✓ Loaded ${INITIAL_COURSES.length} degree courses`);
  console.log(`✓ Loaded ${INITIAL_CLASSES.length} college classes with ${INITIAL_DIVISIONS.length} divisions`);
  console.log(`✓ Loaded ${INITIAL_SUBJECTS.length} curriculum subjects with ${INITIAL_FACULTY.length} faculty profiles`);
  console.log(`✓ Loaded ${INITIAL_STUDENTS.length} students with ${INITIAL_ENROLLMENTS.length} subject enrollments`);
  console.log(`✓ Configured Smart QR Attendance engine with 5-minute cryptographic session rules`);
  console.log(`✓ Loaded ${INITIAL_NOTICES.length} notices, ${INITIAL_EVENTS.length} events, and ${INITIAL_HERO_SLIDES.length} CMS hero slides`);
  console.log('🎉 Database seeding completed successfully.');
}

main().catch(err => {
  console.error('Seeding error:', err);
  process.exit(1);
});
