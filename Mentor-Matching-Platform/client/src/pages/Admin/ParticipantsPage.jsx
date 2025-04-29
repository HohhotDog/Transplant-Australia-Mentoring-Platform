// src/pages/Admin/ParticipantsPage.jsx
import { useParams, Link } from 'react-router-dom';
import { Tabs, Tab } from '@mui/material';
import { useEffect, useState } from 'react';

export default function ParticipantPage() {
  const { sessionId } = useParams();
  const [tabValue, setTabValue] = useState(0);
  const [mentors, setMentors] = useState([]);
  const [mentees, setMentees] = useState([]);


  useEffect(() => {
    fetch(`/api/admin/sessions/${sessionId}/participants/mentors`)
      .then(res => res.json())
      .then(setMentors);

    fetch(`/api/admin/sessions/${sessionId}/participants/mentees`)
      .then(res => res.json())
      .then(setMentees);
  }, [sessionId]);


  const renderTable = (data, columns) => (
    <div className="overflow-x-auto shadow rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col) => (
              <th 
                key={col.header}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((item) => (
            <tr key={item.id}>
              {columns.map((col) => (
                <td 
                  key={col.field} 
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                >
                  {col.render ? col.render(item) : item[col.field]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {data.length === 0 && (
        <div className="text-center py-4 bg-gray-50">
          <span className="text-gray-500">No data available</span>
        </div>
      )}
    </div>
  );

  // Define the columns for the mentor and mentee tables
  const mentorColumns = [
    { header: 'Name', field: 'name' },
    { 
      header: 'Assigned Mentees', 
      field: 'assigned_mentees',
      render: (item) => item.assigned_mentees || 0
    },
    { 
      header: 'Joined Date', 
      field: 'join_date',
      render: (item) => new Date(item.join_date).toLocaleDateString()
    },
    {
      header: 'Action',
      render: (item) => (
        <Link
          to={`/admin/participants/${item.id}`}
          className="text-blue-600 hover:text-blue-900"
        >
          View
        </Link>
      )
    }
  ];

  const menteeColumns = [
    { header: 'Name', field: 'name' },
    { 
      header: 'Matched Date',
      render: (item) => item.matched_date 
        ? new Date(item.matched_date).toLocaleDateString()
        : 'Not matched'
    },
    { 
      header: 'Assigned Mentor', 
      field: 'assigned_mentor',
      render: (item) => item.assigned_mentor || 'Not assigned'
    },
    {
      header: 'Action',
      render: (item) => (
        <Link
          to={`/admin/participants/${item.id}`}
          className="text-blue-600 hover:text-blue-900"
        >
          View
        </Link>
      )
    }
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Session Participants</h1>
      
      <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
        <Tab label={`Mentors (${mentors.length})`} />
        <Tab label={`Mentees (${mentees.length})`} />
      </Tabs>

      <div className="mt-4">
        {tabValue === 0 
          ? renderTable(mentors, mentorColumns)
          : renderTable(mentees, menteeColumns)
        }
      </div>
    </div>
  );
}