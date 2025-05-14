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
  const [assignedError, setAssignedError] = useState(null); // For assigned mentor/mentee error messages
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [error, setError] = useState(null); // For user-facing error messages
  const [showModal, setShowModal] = useState(false);

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
          setAssignedError(null);
        } else {
          setAssigned(null);
          // Show a friendly empty state if no match found, otherwise show error
          setAssignedError(data?.message === "No match found"
            ? "No assigned mentor or mentee."
            : "Failed to load assigned mentor/mentee details.");
        }
      })
      .catch(() => {
        setAssigned(null);
        setAssignedError("Failed to load assigned mentor/mentee details.");
      });
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
    if (!user?.id) {
      alert("You must be logged in to add a comment.");
      return;
    }
    setShowModal(true);
  };

  const handleModalSubmit = () => {
    if (!newComment.trim()) {
      alert("Comment cannot be empty.");
      return;
    }
    const commentData = {
      commenterId: user.id,
      content: newComment,
      sessionId,
    };
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
          setShowModal(false);
        } else {
          alert("Failed to add comment.");
        }
      })
      .catch((err) => alert("Error adding comment."));
  };

  const handleModalCancel = () => {
    setShowModal(false);
    setNewComment("");
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 text-center">Participant Details</h1>

      {error && <p className="text-red-500">{error}</p>}

      {/* Profile Details Section */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold text-left pb-2">Profile Details</h2>
        {profile ? (
          <div className="bg-gray-50 border rounded-lg p-4 shadow-sm">
            <dl>
              <div className="mb-2 flex">
                <dt className="font-semibold w-48">Email:</dt>
                <dd>{profile.email}</dd>
              </div>
              <div className="mb-2 flex">
                <dt className="font-semibold w-48">First Name:</dt>
                <dd>{profile.first_name}</dd>
              </div>
              <div className="mb-2 flex">
                <dt className="font-semibold w-48">Last Name:</dt>
                <dd>{profile.last_name}</dd>
              </div>
              <div className="mb-2 flex">
                <dt className="font-semibold w-48">Date of Birth:</dt>
                <dd>{profile.date_of_birth}</dd>
              </div>
              <div className="mb-2 flex">
                <dt className="font-semibold w-48">Address:</dt>
                <dd>{profile.address}</dd>
              </div>
              <div className="mb-2 flex">
                <dt className="font-semibold w-48">City/Suburb:</dt>
                <dd>{profile.city_suburb}</dd>
              </div>
              <div className="mb-2 flex">
                <dt className="font-semibold w-48">State:</dt>
                <dd>{profile.state}</dd>
              </div>
              <div className="mb-2 flex">
                <dt className="font-semibold w-48">Postal Code:</dt>
                <dd>{profile.postal_code}</dd>
              </div>
              <div className="mb-2 flex">
                <dt className="font-semibold w-48">Gender:</dt>
                <dd>{profile.gender}</dd>
              </div>
              <div className="mb-2 flex">
                <dt className="font-semibold w-48">Aboriginal or Torres Strait Islander:</dt>
                <dd>{profile.aboriginal_or_torres_strait_islander}</dd>
              </div>
              <div className="mb-2 flex">
                <dt className="font-semibold w-48">Language Spoken at Home:</dt>
                <dd>{profile.language_spoken_at_home}</dd>
              </div>
              <div className="mb-2 flex">
                <dt className="font-semibold w-48">Living Situation:</dt>
                <dd>{profile.living_situation}</dd>
              </div>
              <div className="mb-2 flex">
                <dt className="font-semibold w-48">Phone Number:</dt>
                <dd>{profile.phone_number}</dd>
              </div>
              <div className="mb-2 flex">
                <dt className="font-semibold w-48">Bio:</dt>
                <dd>{profile.bio}</dd>
              </div>
            </dl>
          </div>
        ) : (
          <p>Loading profile details...</p>
        )}
      </section>

      {/* Mentorship Preferences Section */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold text-left pb-2">Mentorship Preferences</h2>
        {preferences ? (
          <div className="bg-gray-50 border rounded-lg p-4 shadow-sm">
            <dl>
              <div className="mb-2 flex">
                <dt className="font-semibold w-48">Transplant Type:</dt>
                <dd>{preferences.transplant_type}</dd>
              </div>
              <div className="mb-2 flex">
                <dt className="font-semibold w-48">Session Role:</dt>
                <dd>{preferences.session_role}</dd>
              </div>
              <div className="mb-2 flex">
                <dt className="font-semibold w-48">Transplant Year:</dt>
                <dd>{preferences.transplant_year}</dd>
              </div>
              <div className="mb-2 flex">
                <dt className="font-semibold w-48">Goals:</dt>
                <dd>{preferences.goals}</dd>
              </div>
              <div className="mb-2 flex">
                <dt className="font-semibold w-48">Meeting Preference:</dt>
                <dd>{preferences.meeting_preference}</dd>
              </div>
              <div className="mb-2 flex">
                <dt className="font-semibold w-48">Sports Activities:</dt>
                <dd>{preferences.sports_activities}</dd>
              </div>
            </dl>
          </div>
        ) : (
          <p>Loading mentorship preferences...</p>
        )}
      </section>

      {/* Assigned Mentor/Mentee Section */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold text-left pb-2">Assigned Mentor/Mentee</h2>
        {assignedError ? (
          <p className="text-gray-500">{assignedError}</p>
        ) : assigned ? (
          assigned.role === "mentor" ? (
            <div className="bg-gray-50 border rounded-lg p-4 shadow-sm">
              <p className="font-semibold mb-2">Assigned mentee(s):</p>
              <ul className="list-disc list-inside">
                {assigned.mentees.map((mentee, index) => (
                  <li key={index}>{mentee.name}</li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="bg-gray-50 border rounded-lg p-4 shadow-sm">
              <p className="font-semibold mb-2">Assigned mentor:</p>
              <p>{assigned.mentor.name}</p>
            </div>
          )
        ) : (
          <p>Loading assigned mentor/mentee details...</p>
        )}
      </section>

      {/* Admin Comments Section */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold text-left pb-2">Admin Comments</h2>
        <div className="bg-gray-50 border rounded-lg p-4 shadow-sm">
          <div className="flex justify-end mb-2">
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded"
              onClick={handleAddComment}
            >
              Add Comment
            </button>
          </div>
          {comments.length > 0 ? (
            <ul className="mt-4 space-y-4">
              {comments.map((comment, index) => (
                <li
                  key={index}
                  className="border-b last:border-b-0 pb-3 last:pb-0"
                >
                  <div className="flex items-center mb-1">
                    <span className="font-semibold">{comment.commenter}</span>
                    <span className="text-xs text-gray-500 ml-2">
                      {new Date(comment.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="ml-2">{comment.content}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-gray-500">No comments available.</p>
          )}
        </div>
      </section>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded shadow-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4 text-left pb-2">Add a Comment</h3>
            <textarea
              className="w-full p-2 border rounded mb-4"
              rows="3"
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            ></textarea>
            <div className="flex justify-end space-x-2">
              <button
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded"
                onClick={handleModalCancel}
              >
                Cancel
              </button>
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded"
                onClick={handleModalSubmit}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
