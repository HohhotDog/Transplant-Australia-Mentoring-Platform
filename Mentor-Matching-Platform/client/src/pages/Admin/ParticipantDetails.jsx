import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { useUser } from "../../components/context/UserContext"; // Updated import path

export default function ParticipantDetails() {
  const { userId } = useParams();
  const location = useLocation();
  const { user } = useUser(); // Fetch the logged-in admin's details
  const [profile, setProfile] = useState(null);
  const [preferences, setPreferences] = useState(null);
  const [assigned, setAssigned] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [error, setError] = useState(null); // For user-facing error messages

  console.log("Logged-in user:", user);

  // Extract sessionId from the query string
  const sessionId = new URLSearchParams(location.search).get("sessionId");

  useEffect(() => {
    fetch(`/api/admin/participants/${userId}/profile`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.success) {
          setProfile(data.profile);
        } else {
          throw new Error("Invalid profile data");
        }
      })
      .catch((err) => setError("Failed to load profile details."));
  }, [userId]);

  useEffect(() => {
    fetch(`/api/admin/participants/${userId}/preferences`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.success) {
          setPreferences(data.preferences);
        } else {
          throw new Error("Invalid preferences data");
        }
      })
      .catch((err) => setError("Failed to load mentorship preferences."));
  }, [userId]);

  useEffect(() => {
    fetch(`/api/admin/participants/${userId}/match`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.success) {
          if (data.role === "mentor") {
            setAssigned({ role: "mentor", mentees: data.mentees });
          } else if (data.role === "mentee") {
            setAssigned({ role: "mentee", mentor: data.mentor });
          }
        } else {
          throw new Error("Invalid match data");
        }
      })
      .catch((err) =>
        setError("Failed to load assigned mentor/mentee details.")
      );
  }, [userId]);

  useEffect(() => {
    // Fetch comments for the specific session
    fetch(`/api/comments/${userId}?sessionId=${sessionId}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setComments(data);
        } else {
          throw new Error("Invalid comments data");
        }
      })
      .catch((err) => setError("Failed to load comments."));
  }, [userId, sessionId]);

  const handleAddComment = () => {
    if (!newComment.trim()) {
      alert("Comment cannot be empty.");
      return;
    }

    const commentData = {
      commenterId: user.id, // Use the logged-in admin's ID
      content: newComment,
      sessionId, // Include sessionId in the comment
    };

    console.log("Sending comment data:", commentData);

    fetch(`/api/comments/${userId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(commentData),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setComments((prevComments) => [...prevComments, data.comment]);
          setNewComment("");
        } else {
          alert("Failed to add comment.");
        }
      })
      .catch((err) => alert("Error adding comment."));
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Participant Details</h1>

      {error && <p className="text-red-500">{error}</p>}

      {/* Profile Details Section */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold">Profile Details</h2>
        {profile ? (
          <div>
            <p>Email: {profile.email}</p>
            <p>First Name: {profile.first_name}</p>
            <p>Last Name: {profile.last_name}</p>
            <p>Date of Birth: {profile.date_of_birth}</p>
            <p>Address: {profile.address}</p>
            <p>City/Suburb: {profile.city_suburb}</p>
            <p>State: {profile.state}</p>
            <p>Postal Code: {profile.postal_code}</p>
            <p>Gender: {profile.gender}</p>
            <p>
              Aboriginal or Torres Strait Islander:{" "}
              {profile.aboriginal_or_torres_strait_islander}
            </p>
            <p>Language Spoken at Home: {profile.language_spoken_at_home}</p>
            <p>Living Situation: {profile.living_situation}</p>
            <p>Phone Number: {profile.phone_number}</p>
            <p>Bio: {profile.bio}</p>
          </div>
        ) : (
          <p>Loading profile details...</p>
        )}
      </section>

      {/* Mentorship Preferences Section */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold">Mentorship Preferences</h2>
        {preferences ? (
          <div>
            <p>Transplant Type: {preferences.transplant_type}</p>
            <p>Session Role: {preferences.session_role}</p>
            <p>Transplant Year: {preferences.transplant_year}</p>
            <p>Goals: {preferences.goals}</p>
            <p>Meeting Preference: {preferences.meeting_preference}</p>
            <p>Sports Activities: {preferences.sports_activities}</p>
          </div>
        ) : (
          <p>Loading mentorship preferences...</p>
        )}
      </section>

      {/* Assigned Mentor/Mentee Section */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold">Assigned Mentor/Mentee</h2>
        {assigned ? (
          assigned.role === "mentor" ? (
            <div>
              <p>You are a mentor. Your assigned mentees:</p>
              <ul>
                {assigned.mentees.map((mentee, index) => (
                  <li key={index}>{mentee.name}</li>
                ))}
              </ul>
            </div>
          ) : (
            <div>
              <p>You are a mentee. Your assigned mentor:</p>
              <p>{assigned.mentor.name}</p>
            </div>
          )
        ) : (
          <p>Loading assigned mentor/mentee details...</p>
        )}
      </section>

      {/* Admin Comments Section */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold">Admin Comments</h2>
        <div>
          <textarea
            className="w-full p-2 border rounded mb-2"
            rows="3"
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          ></textarea>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded"
            onClick={handleAddComment}
          >
            Add Comment
          </button>
          {comments.length > 0 ? (
            <ul className="mt-4">
              {comments.map((comment, index) => (
                <li key={index} className="mb-2">
                  <p>
                    <strong>{comment.commenter}</strong> (
                    {new Date(comment.created_at).toLocaleString()}):
                  </p>
                  <p>{comment.content}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4">No comments available.</p>
          )}
        </div>
      </section>
    </div>
  );
}
