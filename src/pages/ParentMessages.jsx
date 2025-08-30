import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import groupImg from '../assets/images/Group.png';
import objectImg from '../assets/images/Object.png';
import Footer from '../components/Footer';

const MESSAGES_API = `${import.meta.env.VITE_API_URL}/api/parent/messages/`;
const SEND_API = `${import.meta.env.VITE_API_URL}/api/parent/message`;
const TUTOR_PROFILE_API = `${import.meta.env.VITE_API_URL}/api/parent/tutor/`;
const AVATAR_PLACEHOLDER = 'https://ui-avatars.com/api/?background=2DB8A1&color=fff&size=128&name=';


// --- Reusable Components ---
const AppHeader = () => (
    <header className="bg-white shadow-sm sticky-top">
        <nav className="container navbar navbar-expand-lg navbar-light">
          <Link className="navbar-brand fw-bold" style={{ color: '#2DB8A1' }} to="/">LearnLink</Link>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav mx-auto">
              <li className="nav-item"><Link className="nav-link" to="/">Home</Link></li>
              <li className="nav-item"><Link className="nav-link" to="/companies">Companies</Link></li>
              <li className="nav-item"><Link className="nav-link" to="/students">Students</Link></li>
            </ul>
            <Link to="/dashboard" className="btn btn-outline-secondary btn-sm">My Dashboard</Link>
          </div>
        </nav>
    </header>
);

const AppFooter = () => (
    <footer className="bg-dark text-white pt-5 pb-4 mt-5">
        <div className="container text-center text-md-start">
            <p className="text-center text-white-50 small">© 2025 LearnLink, Inc. All rights reserved.</p>
        </div>
    </footer>
);
// --- End Reusable Components ---


const ParentMessages = () => {
  const { tutorId } = useParams();
  const [messages, setMessages] = useState([]);
  const [tutor, setTutor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const parentUser = JSON.parse(localStorage.getItem('user'));
  const parentId = parentUser?.id;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const fetchChatData = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const headers = { 'Authorization': token ? `Bearer ${token}` : '' };

            const [messagesRes, tutorRes] = await Promise.all([
                fetch(`${MESSAGES_API}${tutorId}`, { headers }),
                fetch(`${TUTOR_PROFILE_API}${tutorId}`, { headers })
            ]);

            const messagesData = await messagesRes.json();
            const tutorData = await tutorRes.json();

            if (messagesData.success) {
                setMessages(messagesData.data.messages || []);
            } else {
                throw new Error(messagesData.message || 'Failed to fetch messages');
            }

            if (tutorData.success) {
                setTutor(tutorData.data);
            } else {
                throw new Error(tutorData.message || 'Failed to fetch tutor details');
            }

        } catch (err) {
            setError(err.message);
        }
        setLoading(false);
    };

    if (tutorId) {
        fetchChatData();
    }
  }, [tutorId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    setSending(true);
    
    // FIX: Changed 'sender' to 'senderId' to match the likely API structure.
    const tempMessage = {
        _id: Date.now().toString(),
        content: newMessage,
        senderId: { _id: parentId, name: parentUser?.name || 'You' }, // Mock sender as current user
        createdAt: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempMessage]);
    setNewMessage('');
    scrollToBottom();
    
    try {
        const token = localStorage.getItem('token');
        const res = await fetch(SEND_API, {
            method: 'POST',
            headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json',
            },
            body: JSON.stringify({ receiverId: tutorId, content: newMessage }),
        });
        const data = await res.json();
        if (!data.success) {
            setError(data.message || 'Failed to send message');
            setMessages(prev => prev.filter(m => m._id !== tempMessage._id));
        } else {
             const newMessagesRes = await fetch(`${MESSAGES_API}${tutorId}`, { headers: { 'Authorization': token ? `Bearer ${token}` : '' } });
             const newMessagesData = await newMessagesRes.json();
             if(newMessagesData.success) setMessages(newMessagesData.data.messages || []);
        }
    } catch (err) {
        setError('Failed to send message');
        setMessages(prev => prev.filter(m => m._id !== tempMessage._id));
    }
    setSending(false);
  };

  if (loading) {
    return (
        <div className="d-flex justify-content-center align-items-center vh-100" style={{backgroundColor: '#f8f9fa'}}>
            <div className="spinner-border" style={{'--bs-spinner-color': '#2DB8A1', width: '3rem', height: '3rem'}} role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
        </div>
    );
  }

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
            <div className="chat-window card shadow-sm border-0 rounded-4 mx-auto" style={{ maxWidth: '800px', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 150px)' }}>
                <div className="card-header bg-white p-3 border-bottom d-flex align-items-center">
                    <Link to="/dashboard" className="btn btn-light rounded-circle me-3"><i className="bi bi-arrow-left"></i></Link>
                    {tutor && (
                        <>
                            <img src={tutor.avatar || `${AVATAR_PLACEHOLDER}${tutor.name.split(' ').join('+')}`} alt={tutor.name} className="rounded-circle me-3" width="50" height="50" />
                            <div>
                                <h5 className="fw-bold mb-0">{tutor.name}</h5>
                                <p className="text-success small mb-0">Online</p>
                            </div>
                        </>
                    )}
                </div>

                <div className="card-body p-4" style={{ flexGrow: 1, overflowY: 'auto', backgroundColor: '#f8fafc' }}>
                    {error && <div className="alert alert-danger text-center">{error}</div>}
                    {messages.length === 0 && !error && (
                        <div className="text-secondary text-center mt-5">No messages yet. Start the conversation!</div>
                    )}
                    {messages.map(msg => {
                        // FIX: Changed 'msg.sender' to 'msg.senderId' and added optional chaining '?.' for safety.
                        const isSender = msg.senderId?._id === parentId;
                        return (
                            <div key={msg._id} className={`d-flex flex-column mb-3 ${isSender ? 'align-items-end' : 'align-items-start'}`}>
                                <div className={`p-3 rounded-4 shadow-sm ${isSender ? 'bg-primary-custom text-white' : 'bg-white'}`} style={{ maxWidth: '70%', border: isSender ? '' : '1px solid #eee' }}>
                                    {msg.content}
                                </div>
                                <div className="small text-muted mt-1 px-1">
                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>

                <div className="card-footer bg-white p-3 border-top">
                    <form onSubmit={handleSend} className="d-flex gap-2 align-items-center">
                        <input 
                            type="text" 
                            className="form-control form-control-lg border-0 rounded-pill bg-light" 
                            placeholder="Type a message..." 
                            value={newMessage} 
                            onChange={e => setNewMessage(e.target.value)} 
                            disabled={sending} 
                        />
                        <button type="submit" className="btn btn-primary-custom btn-lg rounded-circle" style={{width: '50px', height: '50px'}} disabled={sending || !newMessage.trim()}>
                            <i className="bi bi-send-fill"></i>
                        </button>
                    </form>
                </div>
            </div>
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
        `}</style>
    </div>
  );
};

export default ParentMessages;