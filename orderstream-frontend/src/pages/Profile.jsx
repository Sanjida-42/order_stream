import { useState, useContext, useEffect, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

const Profile = () => {
    const { user, updateUserProfile } = useContext(AuthContext);
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const API_BASE_URL = import.meta.env.VITE_API_STAGING_URL || 'http://localhost:5000';

    // Redirect if not logged in
    useEffect(() => {
        if (!user) {
            navigate('/login');
        }
    }, [user, navigate]);

    const [formData, setFormData] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
        address: user?.address || ''
    });

    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [editMode, setEditMode] = useState(false);

    // Update form data when user data loads
    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                phone: user.phone || '',
                address: user.address || ''
            });
        }
    }, [user]);

    const getImageUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('http')) return url;
        return `${API_BASE_URL}${url}`;
    };

    const handleImageClick = () => {
        if (editMode) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        setMessage({ type: '', text: '' });

        const uploadData = new FormData();
        uploadData.append('file', file);

        try {
            const response = await authAPI.uploadProfileImage(uploadData);
            // After successful upload, the backend returns the image URL
            // We should reload the profile or update the local user state
            await updateUserProfile({ profile_image_url: response.data.profile_image_url });
            setMessage({ type: 'success', text: 'Profile picture updated!' });
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.detail || 'Failed to upload image'
            });
        } finally {
            setUploading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            await updateUserProfile(formData);
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
            setEditMode(false);
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.detail || 'Failed to update profile'
            });
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <div style={styles.header}>
                    <h1 style={styles.title}>My Profile</h1>
                    {!editMode ? (
                        <button onClick={() => setEditMode(true)} style={styles.editButton}>
                            Edit Profile
                        </button>
                    ) : (
                        <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                            Editing Mode
                        </div>
                    )}
                </div>

                {message.text && (
                    <div style={{
                        ...styles.alert,
                        backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da',
                        color: message.type === 'success' ? '#155724' : '#721c24'
                    }}>
                        {message.text}
                    </div>
                )}

                <div style={styles.content}>
                    {/* Profile Image Section */}
                    <div style={styles.imageSection}>
                        <div
                            style={{
                                ...styles.imageContainer,
                                cursor: editMode ? 'pointer' : 'default',
                                opacity: uploading ? 0.7 : 1,
                                position: 'relative'
                            }}
                            onClick={handleImageClick}
                        >
                            {user.profile_image_url ? (
                                <img
                                    src={getImageUrl(user.profile_image_url)}
                                    alt="Profile"
                                    style={styles.profileImage}
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = 'https://via.placeholder.com/150?text=User';
                                    }}
                                />
                            ) : (
                                <div style={styles.placeholderImage}>
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                            )}
                            {editMode && (
                                <div style={styles.uploadOverlay}>
                                    <span>📷 Upload</span>
                                </div>
                            )}
                            {uploading && (
                                <div style={styles.uploadingState}>
                                    <span className="spinner-small"></span>
                                </div>
                            )}
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                            accept="image/*"
                        />
                        <div style={styles.roleTag}>
                            {user.role}
                        </div>
                        {editMode && (
                            <small style={{ color: 'var(--text-muted)', textAlign: 'center' }}>
                                Click photo to upload new one
                            </small>
                        )}
                    </div>

                    {/* Profile Form */}
                    <div style={styles.formSection}>
                        <form onSubmit={handleSubmit}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    disabled={!editMode}
                                    style={editMode ? styles.input : styles.inputDisabled}
                                    required
                                />
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Email</label>
                                <input
                                    type="email"
                                    value={user.email}
                                    disabled={true}
                                    style={{ ...styles.inputDisabled, border: 'none', background: 'transparent' }}
                                />
                                <small style={{ color: '#666' }}>Email cannot be changed</small>
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Phone Number</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    disabled={!editMode}
                                    style={editMode ? styles.input : styles.inputDisabled}
                                    required
                                />
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Delivery Address</label>
                                <textarea
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    disabled={!editMode}
                                    style={{
                                        ...(editMode ? styles.input : styles.inputDisabled),
                                        minHeight: '80px',
                                        resize: 'vertical'
                                    }}
                                />
                            </div>

                            {editMode && (
                                <div style={styles.buttonGroup}>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setEditMode(false);
                                            setFormData({
                                                name: user.name || '',
                                                phone: user.phone || '',
                                                address: user.address || ''
                                            });
                                            setMessage({ type: '', text: '' });
                                        }}
                                        style={styles.cancelButton}
                                        disabled={loading || uploading}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        style={styles.saveButton}
                                        disabled={loading || uploading}
                                    >
                                        {loading ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: {
        padding: '40px 20px',
        maxWidth: '900px',
        margin: '0 auto',
        flex: 1
    },
    card: {
        backgroundColor: 'white',
        borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        overflow: 'hidden',
        padding: '30px'
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
        borderBottom: '1px solid #eee',
        paddingBottom: '20px'
    },
    title: {
        fontSize: '28px',
        color: '#333',
        margin: 0
    },
    editButton: {
        padding: '10px 20px',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontWeight: '600'
    },
    content: {
        display: 'grid',
        gridTemplateColumns: '1fr 2fr',
        gap: '40px'
    },
    imageSection: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '15px'
    },
    imageContainer: {
        width: '150px',
        height: '150px',
        borderRadius: '50%',
        overflow: 'hidden',
        border: '4px solid #fff',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        backgroundColor: '#f8f9fa',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    profileImage: {
        width: '100%',
        height: '100%',
        objectFit: 'cover'
    },
    placeholderImage: {
        fontSize: '64px',
        color: '#adb5bd',
        fontWeight: 'bold'
    },
    roleTag: {
        padding: '5px 12px',
        backgroundColor: '#e8f5e9',
        color: '#28a745',
        borderRadius: '15px',
        fontSize: '14px',
        fontWeight: '600',
        textTransform: 'capitalize'
    },
    formSection: {
        flex: 1
    },
    formGroup: {
        marginBottom: '20px'
    },
    label: {
        display: 'block',
        marginBottom: '8px',
        color: '#555',
        fontWeight: '500'
    },
    input: {
        width: '100%',
        padding: '12px',
        border: '1px solid #ddd',
        borderRadius: '5px',
        fontSize: '16px',
        transition: 'border-color 0.2s'
    },
    inputDisabled: {
        width: '100%',
        padding: '12px',
        border: '1px solid #eee',
        borderRadius: '5px',
        fontSize: '16px',
        backgroundColor: 'transparent',
        color: '#333'
    },
    buttonGroup: {
        display: 'flex',
        gap: '15px',
        marginTop: '30px'
    },
    saveButton: {
        padding: '12px 25px',
        backgroundColor: '#28a745',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        fontSize: '16px',
        fontWeight: '600',
        cursor: 'pointer',
        flex: 1
    },
    cancelButton: {
        padding: '12px 25px',
        backgroundColor: '#6c757d',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        fontSize: '16px',
        fontWeight: '600',
        cursor: 'pointer',
        flex: 1
    },
    alert: {
        padding: '15px',
        borderRadius: '5px',
        marginBottom: '20px',
        textAlign: 'center'
    },
    uploadOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        color: 'white',
        fontSize: '12px',
        padding: '4px 0',
        textAlign: 'center',
        transition: 'opacity 0.2s'
    },
    uploadingState: {
        position: 'absolute',
        inset: 0,
        backgroundColor: 'rgba(255,255,255,0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '50%'
    }
};

export default Profile;
