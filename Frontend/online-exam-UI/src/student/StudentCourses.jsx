import { useEffect, useState } from "react";
import { getMyCourses } from "../services/studentService";
import Skeleton from "../components/Skeleton";
import "./StudentCourses.css";

const StudentCourses = () => {
  const [courses, setCourses] = useState(null);

  useEffect(() => {
    getMyCourses()
      .then(res => setCourses(res.data))
      .catch(() => setCourses([]));
  }, []);

  return (
    <section className="student-courses">
      {/* ================= HEADER ================= */}
      <div className="courses-header">
        <h3>📘 My Courses</h3>

        {Array.isArray(courses) && (
          <span className="course-count">
            {courses.length} total
          </span>
        )}
      </div>

      {/* ================= LOADING ================= */}
      {!courses && (
        <>
          <Skeleton height={28} />
          <Skeleton height={28} />
          <Skeleton height={28} />
        </>
      )}

      {/* ================= EMPTY ================= */}
      {courses && courses.length === 0 && (
        <p className="empty-state">
          No courses enrolled
        </p>
      )}

      {/* ================= DATA ================= */}
      {courses && courses.length > 0 && (
        <ul className="card-list">
          {courses.map(course => (
            <li key={course.id} className="card-item">
              <div className="course-left">
                <strong>{course.courseName}</strong>
                <div className="muted">
                  {course.courseCode}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default StudentCourses;
