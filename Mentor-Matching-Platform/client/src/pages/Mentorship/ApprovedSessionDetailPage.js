// src/pages/Mentorship/ApprovedSessionDetailPage.js
import React, { useState } from 'react';
import SessionDetail from '../../components/Session/SessionDetail';
import MyConnections from '../../components/Session/MyConnections'; // You’ll create this
 
const ApprovedSessionDetailPage = ({ session }) => {
  const [activeTab, setActiveTab] = useState('details');
 
  return (
<div className="max-w-4xl mx-auto p-6">
      {/* Tabs */}
<div className="flex space-x-6 border-b  mb-4">
<button
          onClick={() => setActiveTab('details')}
          className={`pb-2 bg-transparent font-medium ${activeTab === 'details' ? 'border-b-2 border-black text-btnorange' : 'text-black'}`}
>
          Session Details
</button>
<button
          onClick={() => setActiveTab('connections')}
          className={`pb-2 bg-transparent font-medium ${activeTab === 'connections' ? 'border-b-2 border-black text-btnorange' : 'text-black'}`}
>
          My Connections
</button>
</div>
 
      {/* Content */}
      {activeTab === 'details' ? (
<>
<SessionDetail session={session} />
<div className="mt-6 text-center">

</div>
</>
      ) : (
<MyConnections sessionId={session?.id} />
      )}
</div>
  );
};
 
export default ApprovedSessionDetailPage;