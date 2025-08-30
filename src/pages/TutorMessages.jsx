import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import groupImg from '../assets/images/Group.png';
import objectImg from '../assets/images/Object.png';
import Footer from '../components/Footer';

const MESSAGES_API = `${import.meta.env.VITE_API_URL}/api/tutor/messages`;
const MARK_READ_API = `${import.meta.env.VITE_API_URL}/api/tutor/messages/read`;
const SEND_API = `${import.meta.env.VITE_API_URL}/api/tutor/message`;
const AVATAR_PLACEHOLDER = 'https://ui-avatars.com/api/?background=ced4da&color=fff&size=128&name=';


// --- Reusable Components ---
const AppHeader = () => (
    <header className="bg-white shadow-sm sticky-top">
        <nav className="container navbar navbar-expand-lg navbar-light">
          <Link className="navbar-brand fw-bold" style={{ color: '#2DB8A1' }} to="/tutor/dashboard">LearnLink</Link>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item"><Link className="nav-link" to="/tutor/dashboard">Dashboard</Link></li>
              <li className="nav-item"><Link className="nav-link active fw-bold" to="/tutor/messages">Messages</Link></li>
            </ul>
          </div>
        </nav>
    </header>
);
// --- End Reusable Components ---

function TutorMessages() {
  const { parentId: initialParentId } = useParams();
  const [allMessages, setAllMessages] = useState([]);
  const [activeMessages, setActiveMessages] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [chatLoading, setChatLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [selectedParentId, setSelectedParentId] = useState(initialParentId || null);
  const messagesEndRef = useRef(null);

  const tutorUser = JSON.parse(localStorage.getItem('user'));
  const tutorId = tutorUser?.id;

  const conversations = useMemo(() => {
    const conversationsMap = new Map();
    allMessages.forEach(msg => {
      // Get both sender and receiver IDs as strings
      const senderId = String(msg.senderId?._id || msg.senderId);
      const receiverId = String(msg.receiverId?._id || msg.receiverId);

      // The other person is the one who is NOT the tutor
      let otherPerson = null;
      if (senderId !== String(tutorId)) {
        otherPerson = msg.senderId;
      } else if (receiverId !== String(tutorId)) {
        otherPerson = msg.receiverId;
      }
      if (!otherPerson || String(otherPerson._id) === String(tutorId)) return;

      if (!conversationsMap.has(otherPerson._id)) {
        conversationsMap.set(otherPerson._id, {
          user: otherPerson, lastMessage: msg, unreadCount: 0,
        });
      }
      const conv = conversationsMap.get(otherPerson._id);
      if (new Date(msg.createdAt) > new Date(conv.lastMessage.createdAt)) {
        conv.lastMessage = msg;
      }
      if (!msg.isRead && receiverId === String(tutorId)) {
        conv.unreadCount += 1;
      }
    });
    return Array.from(conversationsMap.values()).sort((a,b) => new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt));
  }, [allMessages, tutorId]);

  // Effect to fetch all messages once to build the conversation list
  useEffect(() => {
    const fetchConversationList = async () => {
      setPageLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(MESSAGES_API, { headers: { 'Authorization': `Bearer ${token}` } });
        const data = await res.json();
        if (data.success) {
          setAllMessages(data.data.messages || []);
        } else {
          throw new Error(data.message || 'Failed to fetch conversations');
        }
      } catch (err) {
        setError(err.message);
      }
      setPageLoading(false);
    };
    fetchConversationList();
  }, []);
    
  // Effect to fetch messages for the active conversation whenever it changes
  useEffect(() => {
    if (!selectedParentId) {
        setActiveMessages([]);
        return;
    };

    const fetchActiveChat = async () => {
        setChatLoading(true);
        try {
            const token = localStorage.getItem('token');
            const url = `${MESSAGES_API}?parentId=${selectedParentId}`;
            const res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
            const data = await res.json();
            if (data.success) {
                setActiveMessages(data.data.messages || []);
                const unreadIds = data.data.messages
                    .filter(msg => msg.receiverId?._id === tutorId && !msg.isRead)
                    .map(msg => msg._id);
                if (unreadIds.length > 0) handleMarkRead(unreadIds);
            } else {
                throw new Error(data.message || 'Failed to fetch messages');
            }
        } catch (err) {
            setError(err.message);
        }
        setChatLoading(false);
    };
    
    fetchActiveChat();
  }, [selectedParentId, tutorId]);

  // Effect to ensure selectedParentId is never the tutor's own ID
  useEffect(() => {
    if (selectedParentId && String(selectedParentId) === String(tutorId)) {
      // Find the first valid conversation (not self)
      const validConvs = conversations.filter(c => String(c.user._id) !== String(tutorId));
      setSelectedParentId(validConvs.length > 0 ? validConvs[0].user._id : null);
    }
  }, [selectedParentId, tutorId, conversations]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages]);

  const handleMarkRead = async (messageIds) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(MARK_READ_API, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageIds }),
      });
      setAllMessages(prev => prev.map(msg => messageIds.includes(msg._id) ? { ...msg, isRead: true } : msg));
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedParentId) return;
    setSending(true);
    const tempMessage = {
      _id: Date.now().toString(),
      content: newMessage,
      senderId: { _id: tutorId },
      receiverId: { _id: selectedParentId },
      createdAt: new Date().toISOString()
    };
    setActiveMessages(prev => [...prev, tempMessage]);
    setNewMessage('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(SEND_API, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiverId: selectedParentId, content: newMessage }),
      });
      const data = await res.json();
      if (data.success) {
        const url = `${MESSAGES_API}?parentId=${selectedParentId}`;
        const chatRes = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
        const chatData = await chatRes.json();
        if (chatData.success) {
          setActiveMessages(chatData.data.messages || []);
        }
        const allRes = await fetch(MESSAGES_API, { headers: { 'Authorization': `Bearer ${token}` } });
        const allData = await allRes.json();
        if (allData.success) {
          setAllMessages(allData.data.messages || []);
        }
      } else {
        throw new Error(data.message || 'Failed to send message');
      }
    } catch (err) {
      setError(err.message);
      setActiveMessages(prev => prev.filter(m => m._id !== tempMessage._id));
    }
    setSending(false);
  };
  
  return (
    <div style={{ 
      backgroundColor: '#7ee3f2', 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Images */}
      <img src={groupImg} alt="clouds" style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        width: '100%', 
        maxWidth: '100vw', 
        zIndex: 0, 
        pointerEvents: 'none' 
      }} />
      <img src={objectImg} alt="buildings" style={{ 
        position: 'absolute', 
        bottom: 0, 
        left: 0, 
        width: '100%', 
        maxWidth: '100vw', 
        zIndex: 0, 
        pointerEvents: 'none' 
      }} />
    
        <main className="container flex-grow-1 my-4" style={{ position: 'relative', zIndex: 1 }}>
            <div className="chat-window card shadow-sm border-0 rounded-4 mx-auto" style={{ 
              maxWidth: '1000px', 
              height: 'calc(100vh - 150px)',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)'
            }}>
                <div className="row g-0 h-100">
                    <div className="col-lg-4 border-end d-flex flex-column">
                        <div className="p-3 border-bottom" style={{ backgroundColor: 'rgba(20, 184, 166, 0.1)' }}>
                          <h4 className="fw-bold mb-0" style={{ color: '#14b8a6' }}>
                            <i className="bi bi-chat-dots me-2"></i>
                            Conversations
                          </h4>
                        </div>
                        <div className="list-group list-group-flush overflow-auto">
                            {pageLoading && <div className="p-3 text-center text-secondary">Loading conversations...</div>}
                            {!pageLoading && conversations.length === 0 && <div className="p-3 text-center text-secondary">No messages yet.</div>}
                            {(() => {
                              // Debug: log all conversation user IDs and tutorId
                              console.log('TutorId:', tutorId);
                              console.log('Conversation user IDs:', conversations.map(c => c.user._id));
                              return conversations
                                .filter(({ user }) => String(user._id) !== String(tutorId))
                                .map(({ user, lastMessage, unreadCount }) => (
                                  <button key={user._id} onClick={() => setSelectedParentId(user._id)} className={`list-group-item list-group-item-action p-3 border-0 ${selectedParentId === user._id ? 'active-chat' : ''}`} style={{ transition: 'all 0.2s ease-in-out' }}>
                                    <div className="d-flex w-100 justify-content-between">
                                      <div className="d-flex align-items-center">
                                        <img src={user.avatar || `${AVATAR_PLACEHOLDER}${user.name?.split(' ').join('+')}`} alt={user.name} className="rounded-circle me-3" width="50" height="50" />
                                        <div>
                                          <h6 className="mb-0 fw-bold" style={{ color: '#14b8a6' }}>{user.name}</h6>
                                          <p className="mb-0 text-secondary text-truncate" style={{maxWidth: '150px'}}>{lastMessage.content}</p>
                                        </div>
                                      </div>
                                      <div className="text-end">
                                        <small className="text-muted">{new Date(lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small>
                                        {unreadCount > 0 && <span className="badge rounded-pill mt-1 ms-1" style={{ backgroundColor: '#dc3545' }}>{unreadCount}</span>}
                                      </div>
                                    </div>
                                  </button>
                                ));
                            })()}
                        </div>
                    </div>
                    <div className="col-lg-8 d-flex flex-column">
                        {selectedParentId ? (
                            <>
                                <div className="card-header p-3 border-bottom" style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)' }}>
                                  <h5 className="fw-bold mb-0" style={{ color: '#14b8a6' }}>
                                    <i className="bi bi-person me-2"></i>
                                    {conversations.find(c => c.user._id === selectedParentId)?.user.name}
                                  </h5>
                                </div>
                                <div className="card-body p-4 flex-grow-1 overflow-auto" style={{backgroundColor: '#f8fafc'}}>
                                    {chatLoading ? (
                                      <div className="d-flex justify-content-center align-items-center h-100">
                                        <svg width="60" height="60" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                                          <circle cx="40" cy="40" r="36" stroke="#14b8a6" strokeWidth="8" strokeDasharray="56 56" strokeLinecap="round">
                                            <animateTransform attributeName="transform" type="rotate" from="0 40 40" to="360 40 40" dur="1s" repeatCount="indefinite" />
                                          </circle>
                                        </svg>
                                      </div>
                                    ) : (
                                    <>
                                        {activeMessages.map(msg => {
                                            // FIX: Robustly check senderId for both object and string, and log for debugging
                                            const msgSenderId = msg.senderId?._id || msg.senderId;
                                            // Uncomment for debugging:
                                            // console.log('msgSenderId:', msgSenderId, 'tutorId:', tutorId);
                                            const isSender = String(msgSenderId) === String(tutorId);
                                            return (
                                                <div key={msg._id} className={`d-flex flex-column mb-3 ${isSender ? 'align-items-end' : 'align-items-start'}`}>
                                                    <div className={`p-3 rounded-4 shadow-sm ${isSender ? 'bg-primary-custom text-white' : 'bg-white'}`} style={{ maxWidth: '70%', border: isSender ? '' : '1px solid #e2e8f0' }}>{msg.content}</div>
                                                    <small className="text-muted mt-1 px-1">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small>
                                                </div>
                                            );
                                        })}
                                    </>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>
                                <div className="card-footer p-3 border-top" style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)' }}>
                                    <form onSubmit={handleSend} className="d-flex gap-2">
                                        <input type="text" className="form-control form-control-lg border-0 rounded-pill bg-light" placeholder="Type a message..." value={newMessage} onChange={e => setNewMessage(e.target.value)} disabled={sending || chatLoading} />
                                        <button type="submit" className="btn btn-primary-custom btn-lg rounded-circle" style={{width: '50px', height: '50px'}} disabled={sending || !newMessage.trim()}>
                                          <i className="bi bi-send-fill"></i>
                                        </button>
                                    </form>
                                </div>
                            </>
                        ) : (
                            <div className="d-flex flex-column align-items-center justify-content-center h-100 text-center text-secondary">
                              <i className="bi bi-chat-dots-fill display-1" style={{ color: '#14b8a6' }}></i>
                              <h4 className="mt-3" style={{ color: '#14b8a6' }}>Select a conversation</h4>
                              <p>Choose a parent from the list to view your message history.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {error && <div className="alert alert-danger mt-3" style={{ backgroundColor: 'rgba(220, 53, 69, 0.1)', borderColor: '#dc3545', color: '#dc3545' }}>{error}</div>}
        </main>
        
        <div style={{ position: 'relative', zIndex: 2 }}>
          <Footer />
        </div>
        
        <style>{`
            .bg-primary-custom {
                background-color: #14b8a6 !important;
            }
            .btn-primary-custom {
                background-color: #14b8a6 !important;
                border-color: #14b8a6 !important;
            }
            .btn-primary-custom:hover {
                background-color: #0d9488 !important;
                border-color: #0d9488 !important;
            }
            .active-chat { 
                background-color: rgba(20, 184, 166, 0.1) !important; 
                border-right: 4px solid #14b8a6; 
            }
        `}</style>
    </div>
  );
}

export default TutorMessages;