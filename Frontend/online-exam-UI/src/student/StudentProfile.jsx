import { useEffect, useState } from "react";
import { getMyProfile } from "../services/studentService";
import "./StudentProfile.css";

const StudentProfile = () => {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    getMyProfile()
      .then(res => setProfile(res.data))
      .catch(err => {
        console.error(err);
        setError("Failed to load profile");
      });
  }, []);

  if (error) return <p>{error}</p>;
  if (!profile) return <p>Loading profile...</p>;

  const {
    name = "—",
    email = "—",
    role = "—",
    createdAt
  } = profile;

  return (
    <div className="student-profile">
      <div className="content-card profile-card">
        <h3> Profile</h3>

        <div className="profile-grid">
          <div className="profile-item">
            <span className="label">Name</span>
            <span className="value">{name}</span>
          </div>

          <div className="profile-item">
            <span className="label">Email</span>
            <span className="value">{email}</span>
          </div>

          <div className="profile-item">
            <span className="label">Role</span>
            <span className="value">{role}</span>
          </div>

          <div className="profile-item">
            <span className="label">Joined</span>
            <span className="value">
              {createdAt
                ? new Date(createdAt).toLocaleDateString()
                : "—"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
