import { useState, useMemo, useEffect, useRef } from 'react';
import { api } from '../services/apiService';

const categories = [
  { key: 'All', label: 'All', match: 'All' },
  { key: 'PAN', label: 'PAN', match: 'PAN' },
  { key: 'Aadhaar', label: 'Aadhaar', match: 'Aadhaar' },
  { key: 'GST', label: 'GST', match: 'GST Certificate' },
  { key: 'Bank', label: 'Bank', match: 'Bank Statement' },
  { key: 'ITR', label: 'ITR', match: 'ITR Copy' },
  { key: 'Biz', label: 'Biz', match: 'Business Documents' }
];

export default function Documents({ documents, onUploadSuccess, addNotification, setActiveTab, requests }) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [uploading, setUploading] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);
  
  // Custom camera and upload options state
  const [showUploadOptions, setShowUploadOptions] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraFlash, setCameraFlash] = useState(false);
  const [cameraCapturedImage, setCameraCapturedImage] = useState(false);
  const [capturedPhotoUrl, setCapturedPhotoUrl] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  const triggerCameraScan = (category) => {
    setUploadCategory(category);
    setShowCamera(true);
  };

  const triggerFilePick = (category) => {
    setUploadCategory(category);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleRealFileSelected = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setStagedFile({
      realFile: file,
      name: file.name,
      category: uploadCategory,
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`
    });
    addNotification(`${file.name} selected! Confirm to upload.`, 'success');
  };

  useEffect(() => {
    if (showCamera) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then(stream => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
          streamRef.current = stream;
        })
        .catch(err => {
          console.error('Error accessing camera:', err);
          addNotification('Camera access failed. Please select a file from your device.', 'error');
        });
    } else {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    }
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [showCamera, addNotification]);

  const capturePhoto = () => {
    setCameraFlash(true);
    setTimeout(() => setCameraFlash(false), 400);

    if (streamRef.current && videoRef.current) {
      try {
        const video = videoRef.current;
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const dataUrl = canvas.toDataURL('image/jpeg');
        setCapturedPhotoUrl(dataUrl);
        setCameraCapturedImage(true);

        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
      } catch (err) {
        console.error('Error capturing canvas frame:', err);
        setCameraCapturedImage(true);
      }
    } else {
      setCameraCapturedImage(true);
    }
  };

  const handleRetake = () => {
    setCapturedPhotoUrl(null);
    setCameraCapturedImage(false);
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      .then(stream => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        streamRef.current = stream;
      })
      .catch(err => {
        console.error('Error restarting camera:', err);
      });
  };

  const [uploadCategory, setUploadCategory] = useState(() => {
    return localStorage.getItem('preselectUploadCategory') || 'PAN';
  });

  useEffect(() => {
    // Clear preselection from other screens on mount
    localStorage.removeItem('preselectUploadCategory');
  }, []);
  
  // Interactive staging state for upload preview
  const [stagedFile, setStagedFile] = useState(null);

  const checklist = useMemo(() => {
    const categoryMapping = {
      'PAN': 'PAN',
      'Aadhaar': 'AADHAAR',
      'Bank Statement': 'BANK_STATEMENT',
      'ITR Copy': 'ITR',
      'GST Certificate': 'GST'
    };

    const checkItem = (displayCat, reqType) => {
      const dbCat = categoryMapping[displayCat];
      const doc = documents.find(d => d.category === dbCat);
      if (doc) {
        let displayStatus = 'Uploaded';
        if (doc.status === 'APPROVED') displayStatus = 'Approved';
        else if (doc.status === 'REJECTED') displayStatus = 'Rejected';
        else if (doc.status === 'UNDER_REVIEW' || doc.status === 'UPLOADED') displayStatus = 'Under Review';

        return { category: displayCat, dbCategory: dbCat, status: displayStatus, name: doc.name, reason: doc.reason };
      }
      return { category: displayCat, dbCategory: dbCat, status: 'Missing', reqType };
    };

    return [
      checkItem('PAN', 'Required'),
      checkItem('Aadhaar', 'Required'),
      checkItem('Bank Statement', 'Required'),
      checkItem('ITR Copy', 'Required'),
      checkItem('GST Certificate', 'Optional')
    ];
  }, [documents]);

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDropSimulation = (e) => {
    e.preventDefault();
    const fakeName = `${uploadCategory}_Upload_${Math.floor(100 + Math.random() * 900)}.pdf`;
    setStagedFile({
      name: fakeName,
      category: uploadCategory,
      size: `${(1 + Math.random() * 4).toFixed(1)} MB`
    });
    addNotification('File staged! Verify preview to upload.', 'info');
  };

  const handleSelectFileClick = () => {
    setShowUploadOptions(true);
  };

  const confirmStagedUpload = async () => {
    if (!stagedFile) return;
    setUploading(true);
    addNotification('Uploading to secure vault...', 'info');

    const reqId = (requests && requests.length > 0) ? requests[0].id : (localStorage.getItem('activeRequestId') || undefined);

    try {
      // Use the real file if available, otherwise create a minimal metadata object
      const fileToUpload = stagedFile.realFile || { name: stagedFile.name, size: 0 };
      const res = await api.uploadDocument(fileToUpload, stagedFile.category, reqId);
      
      onUploadSuccess(res.document);
      setStagedFile(null);
      addNotification(`${stagedFile.category} uploaded successfully! ✅`, 'success');
      
      // Auto-notify expert
      const expertId = (requests && requests.length > 0) ? (requests[0].expertId || requests[0].userId) : null;
      if (expertId) {
        try {
          await api.sendMessage(expertId, `📄 Client uploaded: ${stagedFile.category} (${stagedFile.name}) to secure vault.`);
        } catch (chatErr) {
          console.log('Silent skip chat auto-msg:', chatErr);
        }
      }
    } catch (err) {
      console.error('Upload failed:', err);
      addNotification(`Upload failed: ${err.message}. Please try again.`, 'error');
    } finally {
      setUploading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved': return 'var(--success)';
      case 'Rejected': return 'var(--error)';
      case 'Under Review': return '#F59E0B';
      default: return 'var(--text-secondary)';
    }
  };

  const filteredChecklist = useMemo(() => {
    const activeCategory = categories.find(cat => cat.key === selectedCategory);
    return checklist.filter(item => {
      const docTitle = item.category === 'ITR Copy' ? 'Form 16 / Prev ITR' : (item.category === 'Bank Statement' ? 'Bank Statement' : (item.category === 'GST Certificate' ? 'GST Certificate' : `${item.category} Card`));
      const matchesSearch = docTitle.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (item.name && item.name.toLowerCase().includes(searchQuery.toLowerCase()));
      
      let matchesCategory = selectedCategory === 'All';
      if (!matchesCategory && activeCategory) {
        if (selectedCategory === 'ITR' && item.category === 'ITR Copy') {
          matchesCategory = true;
        } else if (selectedCategory === 'Bank' && item.category === 'Bank Statement') {
          matchesCategory = true;
        } else if (selectedCategory === 'GST' && item.category === 'GST Certificate') {
          matchesCategory = true;
        } else {
          matchesCategory = item.category === activeCategory.match;
        }
      }
      return matchesSearch && matchesCategory;
    });
  }, [checklist, selectedCategory, searchQuery]);

  const getCategoryIcon = (key, active) => {
    const stroke = active ? '#ffffff' : 'var(--text-secondary)';
    switch (key) {
      case 'PAN':
        return (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2.5" style={{ marginRight: '4px' }}>
            <rect x="3" y="4" width="18" height="16" rx="2" />
            <circle cx="9" cy="12" r="3" />
            <path d="M14 9h5M14 13h5M14 17h3" />
          </svg>
        );
      case 'Aadhaar':
        return (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2.5" style={{ marginRight: '4px' }}>
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        );
      case 'Bank':
        return (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2.5" style={{ marginRight: '4px' }}>
            <rect x="3" y="22" width="18" height="2" />
            <path d="M5 22V10M19 22V10M12 22V10M4 10l8-8 8 8" />
          </svg>
        );
      case 'GST':
        return (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2.5" style={{ marginRight: '4px' }}>
            <line x1="19" y1="5" x2="5" y2="19" />
            <circle cx="6.5" cy="6.5" r="2.5" fill="none" />
            <circle cx="17.5" cy="17.5" r="2.5" fill="none" />
          </svg>
        );
      case 'ITR':
        return (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2.5" style={{ marginRight: '4px' }}>
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
        );
      case 'Biz':
        return (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2.5" style={{ marginRight: '4px' }}>
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div 
      className="screen-shell animate-fade-in-up"
      style={{
        gap: '16px',
        paddingTop: '20px',
        paddingBottom: '40px',
        backgroundColor: '#FFFFFF',
        position: 'relative'
      }}
    >
      {/* Hidden real file input for device file picker */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.pdf,.doc,.docx"
        style={{ display: 'none' }}
        onChange={handleRealFileSelected}
      />
      {/* Top Header Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        {/* Back Button */}
        <button 
          onClick={() => setActiveTab ? setActiveTab('home') : null}
          aria-label="Back"
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            border: '1px solid var(--border-color)',
            backgroundColor: 'var(--bg-card)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-sm)',
            transition: 'all var(--transition-fast)'
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        {/* Title */}
        <div style={{ textAlign: 'center', flex: 1, padding: '0 8px' }}>
          <h3 className="title-accent" style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            Documents
          </h3>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', display: 'block', marginTop: '2px' }}>
            Upload & review
          </span>
        </div>

        {/* Vault Button */}
        <div 
          style={{
            border: '1.5px solid rgba(14, 165, 233, 0.3)',
            color: '#0ea5e9',
            backgroundColor: '#EFF6FF',
            padding: '8px 14px',
            borderRadius: '12px',
            fontSize: '0.76rem',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-sm)'
          }}
          onClick={() => addNotification('Entering Secure Vault mode...', 'success')}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          Vault
        </div>
      </div>

      {/* Permission handling is native on Capacitor mobile platform */}

      {/* Interactive Camera Mockup Viewport */}
      {showCamera && (
        <div className="camera-viewfinder" style={{ zIndex: 999 }}>
          {/* Real Video Stream element */}
          {!cameraCapturedImage && (
            <video 
              ref={videoRef}
              autoPlay 
              playsInline 
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                zIndex: 1
              }}
            />
          )}

          {/* Flash animation simulation layer */}
          <div className={`camera-flash-simulation ${cameraFlash ? 'camera-flash-active' : ''}`} style={{ zIndex: 9 }} />
          
          <div className="camera-grid" style={{ zIndex: 2 }}>
            <div className="camera-grid-line-h" style={{ gridColumn: 'span 3', borderBottom: '1px dashed rgba(255,255,255,0.15)', height: '33.3%' }} />
            <div className="camera-grid-line-h" style={{ gridColumn: 'span 3', borderBottom: '1px dashed rgba(255,255,255,0.15)', height: '33.3%' }} />
            <div style={{ display: 'flex', height: '100%', position: 'absolute', top: 0, left: 0, right: 0 }}>
              <div className="camera-grid-line-v" style={{ width: '33.3%', borderRight: '1px dashed rgba(255,255,255,0.15)' }} />
              <div className="camera-grid-line-v" style={{ width: '33.3%', borderRight: '1px dashed rgba(255,255,255,0.15)' }} />
            </div>
          </div>

          {/* Top Bar inside viewfinder */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
            <button 
              onClick={() => { setShowCamera(false); setCameraCapturedImage(false); setCapturedPhotoUrl(null); }}
              aria-label="Close camera scanner" 
              style={{ background: 'rgba(0,0,0,0.5)', border: 'none', color: 'white', padding: '8px 14px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
            >
              Cancel
            </button>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.5px', color: 'var(--secondary)' }}>
              {uploadCategory} SCANNER
            </span>
            <div style={{ width: '50px' }} />
          </div>

          {/* Guide Overlay Bounding Box */}
          {!cameraCapturedImage ? (
            <div className="camera-guide-box" style={{ zIndex: 5 }}>
              <div className="camera-scanline" />
              <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.7)', fontWeight: 600, textAlign: 'center', padding: '0 16px', zIndex: 10 }}>
                Position your {uploadCategory} card flat inside this box
              </span>
            </div>
          ) : (
            /* Real Captured Image Preview */
            <div 
              style={{
                width: '85%',
                height: '180px',
                margin: 'auto',
                borderRadius: '12px',
                border: '3px solid var(--success)',
                overflow: 'hidden',
                boxShadow: '0 10px 20px rgba(0,0,0,0.3)',
                position: 'relative'
              }}
            >
              {capturedPhotoUrl ? (
                <img 
                  src={capturedPhotoUrl} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  alt="Captured document" 
                />
              ) : (
                <div style={{
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                  color: '#0f172a',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: '16px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--success)' }}>MOCK SCANNED OK</span>
                    <span style={{ fontSize: '0.7rem' }}>📄</span>
                  </div>
                  <div>
                    <h6 style={{ fontSize: '0.85rem', fontWeight: 800 }}>GOVT OF INDIA</h6>
                    <div style={{ width: '80px', height: '6px', backgroundColor: '#94a3b8', borderRadius: '3px', marginTop: '4px' }} />
                  </div>
                </div>
              )}
              <span style={{ position: 'absolute', top: '10px', left: '10px', fontSize: '0.65rem', fontWeight: 800, background: 'var(--success)', color: 'white', padding: '2px 6px', borderRadius: '4px' }}>
                CAPTURE OK
              </span>
            </div>
          )}

          {/* Bottom Bar inside viewfinder */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center', zIndex: 10 }}>
            {!cameraCapturedImage ? (
              <>
                <p style={{ fontSize: '0.7rem', color: '#cbd5e1', fontWeight: 600 }}>Hold steady. Auto-focus active.</p>
                <button 
                  className="camera-shutter-btn" 
                  onClick={capturePhoto}
                />
              </>
            ) : (
              <div style={{ display: 'flex', gap: '16px', width: '100%' }}>
                <button 
                  onClick={handleRetake}
                  className="btn btn-secondary"
                  style={{ flex: 1, padding: '10px', fontSize: '0.8rem', borderRadius: '10px', backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}
                >
                  Retake
                </button>
                <button 
                  onClick={() => {
                    // Convert captured photo dataURL to real Blob for upload
                    let realFile = null;
                    if (capturedPhotoUrl) {
                      try {
                        const byteString = atob(capturedPhotoUrl.split(',')[1]);
                        const mimeString = capturedPhotoUrl.split(',')[0].split(':')[1].split(';')[0];
                        const ab = new ArrayBuffer(byteString.length);
                        const ia = new Uint8Array(ab);
                        for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
                        realFile = new File([ab], `Camera_${uploadCategory}_${Date.now()}.jpg`, { type: mimeString });
                      } catch (err) {
                        console.warn('Blob conversion failed:', err);
                      }
                    }
                    const displayName = realFile?.name || `Camera_Capture_${uploadCategory}_${Math.floor(100 + Math.random() * 900)}.jpg`;
                    setStagedFile({
                      realFile: realFile,
                      name: displayName,
                      category: uploadCategory,
                      size: realFile ? `${(realFile.size / (1024 * 1024)).toFixed(1)} MB` : '1.2 MB',
                      previewUrl: capturedPhotoUrl
                    });
                    setShowCamera(false);
                    setCameraCapturedImage(false);
                    setCapturedPhotoUrl(null);
                    addNotification('Photo captured! Confirm upload now.', 'success');
                  }}
                  className="btn btn-primary"
                  style={{ flex: 1, padding: '10px', fontSize: '0.8rem', borderRadius: '10px', backgroundColor: 'var(--success)', color: 'white' }}
                >
                  Use Photo
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Upload Options drawer */}
      {showUploadOptions && (
        <div 
          onClick={() => setShowUploadOptions(false)}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'flex-end',
            zIndex: 998,
            backdropFilter: 'blur(3px)',
            height: '100%',
            width: '100%'
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="animate-fade-in-up"
            style={{
              width: '100%',
              backgroundColor: 'var(--bg-phone)',
              borderRadius: '24px 24px 0 0',
              padding: '24px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 className="title-accent" style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>Add {uploadCategory}</h4>
              <button 
                onClick={() => setShowUploadOptions(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', color: 'var(--text-secondary)' }}
              >
                ✕
              </button>
            </div>
            
            <button 
              onClick={() => {
                setShowUploadOptions(false);
                triggerCameraScan(uploadCategory);
              }}
              className="btn btn-secondary"
              style={{ padding: '14px', fontSize: '0.85rem', display: 'flex', gap: '10px', justifyContent: 'flex-start', border: '1px solid var(--border-color)', borderRadius: '12px' }}
            >
              <span>📷</span> <strong>Take Photo / Scan</strong>
            </button>

            <button 
              onClick={() => {
                setShowUploadOptions(false);
                triggerFilePick(uploadCategory);
              }}
              className="btn btn-secondary"
              style={{ padding: '14px', fontSize: '0.85rem', display: 'flex', gap: '10px', justifyContent: 'flex-start', border: '1px solid var(--border-color)', borderRadius: '12px' }}
            >
              <span>📁</span> <strong>Upload Document / PDF</strong>
            </button>
          </div>
        </div>
      )}

      {/* Overall Progress Card */}
      {(() => {
        const categoryMapping = {
          'PAN': 'PAN',
          'Aadhaar': 'AADHAAR',
          'Bank Statement': 'BANK_STATEMENT',
          'ITR Copy': 'ITR'
        };
        const requiredCategories = ['PAN', 'Aadhaar', 'Bank Statement', 'ITR Copy'];
        const uploadedRequired = requiredCategories.filter(cat => {
          const dbCat = categoryMapping[cat];
          return documents.some(d => d.category === dbCat && (d.status === 'UPLOADED' || d.status === 'APPROVED' || d.status === 'UNDER_REVIEW'));
        });
        const uploadedCount = uploadedRequired.length;
        const progressPercentage = Math.round((uploadedCount / 4) * 100);
        
        // Milestone conditions
        const isUploadDone = documents.length > 0;
        const isVerifyDone = isUploadDone && documents.every(d => d.status === 'APPROVED');
        const isReviewDone = isUploadDone && documents.some(d => d.status === 'APPROVED' || d.status === 'UNDER_REVIEW' || d.status === 'UPLOADED');
        const isComplete = progressPercentage === 100 && documents.every(d => d.status === 'APPROVED');

        return (
          <div 
            className="card"
            style={{
              display: 'flex',
              flexDirection: 'column',
              padding: '18px',
              borderRadius: '20px',
              border: '1.5px solid rgba(226, 232, 240, 0.8)',
              backgroundColor: '#FFFFFF',
              boxShadow: '0 4px 20px rgba(10, 37, 64, 0.03)',
              width: '100%',
              gap: '12px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '12px' }}>
              {/* Circular Progress */}
              <div style={{ position: 'relative', width: '68px', height: '68px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="68" height="68" viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(14, 165, 233, 0.08)" strokeWidth="3.2" />
                  <circle 
                    cx="18" 
                    cy="18" 
                    r="16" 
                    fill="none" 
                    stroke={progressPercentage === 100 ? 'var(--success)' : '#2563EB'} 
                    strokeWidth="3.2" 
                    strokeDasharray={`${progressPercentage}, 100`} 
                    style={{ transition: 'stroke-dasharray 1s ease-in-out', strokeLinecap: 'round' }}
                  />
                </svg>
                <span style={{ position: 'absolute', fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-accent)' }}>
                  {progressPercentage}%
                </span>
              </div>

              {/* Details */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: '0.62rem', fontWeight: 800, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                  Overall Progress
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                  <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                    {uploadedCount} of 4 Files Uploaded
                  </h4>
                  <span 
                    style={{
                      fontSize: '0.64rem',
                      fontWeight: 800,
                      color: progressPercentage === 100 ? 'var(--success)' : '#2563EB',
                      backgroundColor: progressPercentage === 100 ? 'rgba(16, 185, 129, 0.1)' : '#EFF6FF',
                      padding: '3px 8px',
                      borderRadius: '12px',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {progressPercentage === 100 ? 'All Staged!' : 'Uploading docs...'}
                  </span>
                </div>
              </div>
            </div>

            {/* Thick dynamic progress bar */}
            <div style={{ width: '100%', height: '8px', backgroundColor: '#EFF6FF', borderRadius: '4px', overflow: 'hidden', position: 'relative' }}>
              <div style={{ width: `${progressPercentage}%`, height: '100%', backgroundColor: progressPercentage === 100 ? 'var(--success)' : '#2563EB', borderRadius: '4px', transition: 'width 0.6s ease-in-out' }} />
            </div>

            {/* Horizontal milestones timeline checklist */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginTop: '4px', fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
              {/* Upload */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: isUploadDone ? '#10B981' : 'var(--text-tertiary)' }}>
                <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: isUploadDone ? '#10B981' : 'var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>
                  {isUploadDone ? (
                    <svg width="8" height="6" viewBox="0 0 10 8" fill="none">
                      <path d="M1.5 4L4 6.5L8.5 1.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : '1'}
                </div>
                <span>Upload</span>
              </div>

              {/* Verify */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: isVerifyDone ? '#10B981' : 'var(--text-tertiary)' }}>
                <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: isVerifyDone ? '#10B981' : 'var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>
                  {isVerifyDone ? (
                    <svg width="8" height="6" viewBox="0 0 10 8" fill="none">
                      <path d="M1.5 4L4 6.5L8.5 1.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : '2'}
                </div>
                <span>Verify</span>
              </div>

              {/* Review */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: isReviewDone ? '#10B981' : 'var(--text-tertiary)' }}>
                <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: isReviewDone ? '#10B981' : 'var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>
                  {isReviewDone ? (
                    <svg width="8" height="6" viewBox="0 0 10 8" fill="none">
                      <path d="M1.5 4L4 6.5L8.5 1.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : '3'}
                </div>
                <span>Review</span>
              </div>

              {/* Complete */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: isComplete ? '#10B981' : 'var(--text-tertiary)' }}>
                <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: isComplete ? '#10B981' : 'var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.6rem', fontWeight: 800, flexShrink: 0 }}>
                  {isComplete ? (
                    <svg width="8" height="6" viewBox="0 0 10 8" fill="none">
                      <path d="M1.5 4L4 6.5L8.5 1.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : '4'}
                </div>
                <span>Complete</span>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Select Category Upload Destination Box */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.74rem', fontWeight: 800, color: 'var(--text-tertiary)' }}>
          <span>UPLOAD DESTINATION</span>
          <select 
            value={uploadCategory}
            onChange={(e) => setUploadCategory(e.target.value)}
            style={{
              border: 'none',
              backgroundColor: 'transparent',
              color: '#2563EB',
              fontWeight: 800,
              cursor: 'pointer',
              outline: 'none',
              fontSize: '0.74rem'
            }}
          >
            {categories.slice(1).map(cat => (
              <option key={cat.key} value={cat.match}>{cat.label}</option>
            ))}
          </select>
        </div>

        {/* Upload / Scan Dual Action Cards Grid */}
        {!stagedFile ? (
          <div style={{ display: 'grid', gridTemplateColumns: '2.1fr 1fr', gap: '12px', width: '100%', flexShrink: 0 }}>
            {/* Upload File Card */}
            <div 
              onClick={handleSelectFileClick}
              onDragOver={handleDragOver}
              onDrop={handleDropSimulation}
              className="card animate-pulse-slow"
              style={{
                border: '2px dashed #2563EB',
                borderRadius: '16px',
                padding: '20px 14px',
                textAlign: 'center',
                cursor: 'pointer',
                backgroundColor: '#F8FAFC',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                transition: 'all var(--transition-fast)',
                height: '110px'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#EFF6FF'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
            >
              {uploading ? (
                <div style={{ width: '28px', height: '28px', border: '3px solid #2563EB', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              ) : (
                <>
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
                  </svg>
                  <h5 style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                    Tap to upload or drag & drop
                  </h5>
                  <p style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', margin: 0 }}>
                    PDF, JPG, PNG • Max 10MB
                  </p>
                </>
              )}
            </div>

            {/* Scan Card */}
            <div 
              onClick={() => {
                setShowCamera(true);
              }}
              className="card"
              style={{
                border: '1.5px solid var(--border-color)',
                borderRadius: '16px',
                padding: '20px 10px',
                textAlign: 'center',
                cursor: 'pointer',
                backgroundColor: '#FFFFFF',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                transition: 'all var(--transition-fast)',
                height: '110px'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FFFFFF'}
            >
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2M7 12h10M12 7v10" />
              </svg>
              <h5 style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                Scan
              </h5>
              <p style={{ fontSize: '0.62rem', color: 'var(--text-secondary)', margin: 0 }}>
                Document
              </p>
            </div>
          </div>
        ) : (
          /* Staged Upload Verification Preview Card */
          <div 
            className="card animate-scale-in"
            style={{
              borderColor: '#2563EB',
              backgroundColor: '#EFF6FF',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              width: '100%'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#2563EB', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Verify file preview before upload
              </span>
              <button 
                onClick={() => setStagedFile(null)}
                aria-label="Remove staged file"
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem', color: 'var(--text-secondary)' }}
              >
                ✕
              </button>
            </div>
            
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              {stagedFile.previewUrl ? (
                <img 
                  src={stagedFile.previewUrl} 
                  style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border-color)' }} 
                  alt="Staged snapshot" 
                />
              ) : (
                <span style={{ fontSize: '1.8rem' }}>📄</span>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <h5 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', margin: 0 }}>
                  {stagedFile.name}
                </h5>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', display: 'block', marginTop: '2px' }}>
                  Target Vault: <strong>{stagedFile.category}</strong> • Size: {stagedFile.size}
                </span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button 
                onClick={() => setStagedFile(null)} 
                className="btn btn-secondary" 
                style={{ padding: '8px', fontSize: '0.75rem', borderRadius: '8px' }}
              >
                Replace file
              </button>
              <button 
                onClick={confirmStagedUpload} 
                className="btn btn-primary" 
                style={{ padding: '8px', fontSize: '0.75rem', borderRadius: '8px', background: '#2563EB' }}
              >
                Upload
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Search Bar + Filter Funnel Grid */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%' }}>
        {/* Search Input */}
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            border: '1.5px solid var(--border-color)',
            borderRadius: '12px',
            padding: '10px 14px',
            backgroundColor: 'var(--bg-surface)',
            flex: 1
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input 
            type="text" 
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              border: 'none',
              outline: 'none',
              fontSize: '0.85rem',
              width: '100%',
              backgroundColor: 'transparent',
              color: 'var(--text-primary)',
              fontWeight: 500
            }}
          />
        </div>

        {/* Filter Button */}
        <button
          style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            border: '1.5px solid var(--border-color)',
            backgroundColor: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            flexShrink: 0
          }}
          onClick={() => addNotification('Filter properties opened', 'info')}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
          </svg>
        </button>
      </div>

      {/* Horizontal categories scroll filter */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', scrollbarWidth: 'none', padding: '4px 0', width: '100%', flexShrink: 0 }}>
        {categories.map(cat => {
          const isActive = selectedCategory === cat.key;
          return (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                border: '1.5px solid',
                borderColor: isActive ? '#2563EB' : 'var(--border-color)',
                backgroundColor: isActive ? '#2563EB' : '#FFFFFF',
                color: isActive ? '#FFFFFF' : 'var(--text-secondary)',
                fontSize: '0.74rem',
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                transition: 'all var(--transition-fast)'
              }}
            >
              {getCategoryIcon(cat.key, isActive)}
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Privacy Vault Shield Strip */}
      <div 
        className="card" 
        style={{ 
          color: '#ffffff', 
          display: 'flex', 
          gap: '12px', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #091E42 0%, #0F2A54 100%)', 
          borderColor: 'rgba(56, 189, 248, 0.15)', 
          padding: '14px',
          borderRadius: '20px',
          width: '100%'
        }}
      >
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', minWidth: 0 }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'rgba(56, 189, 248, 0.1)', display: 'flex', alignItems: 'center', justifyPoint: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <div style={{ minWidth: 0 }}>
            <h5 style={{ fontSize: '0.76rem', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
              Your data is secure
            </h5>
            <span style={{ fontSize: '0.64rem', color: '#94A3B8', display: 'block', marginTop: '2px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
              AES-256 encryption • Only your CA can access uploaded files.
            </span>
          </div>
        </div>

        {/* 100% Safe Badge */}
        <span 
          style={{
            fontSize: '0.64rem',
            fontWeight: 800,
            color: '#10B981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            padding: '4px 10px',
            borderRadius: '12px',
            whiteSpace: 'nowrap',
            border: '1px solid rgba(16, 185, 129, 0.2)'
          }}
        >
          ✓ 100% Safe
        </span>
      </div>

      {/* Document Status Checklist Container */}
      <div style={{ width: '100%' }}>
        <h4 style={{ fontSize: '0.76rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '12px', margin: 0 }}>
          Document Status
        </h4>
        
        <div className="card" style={{ padding: 0, borderRadius: '20px', overflow: 'hidden', border: '1.5px solid rgba(226, 232, 240, 0.8)', backgroundColor: '#FFFFFF' }}>
          {filteredChecklist.length === 0 ? (
            <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>
              📁 No documents matches the search filters.
            </div>
          ) : (
            filteredChecklist.map((item, idx) => {
              // Document styling setups
              let docTitle = 'PAN Card';
              let docDesc = item.name || 'PAN_Card.pdf';
              let iconBg = '#E6F4EA';
              let strokeColor = '#137333';
              if (item.category === 'PAN') {
                docTitle = 'PAN Card';
                docDesc = item.name || 'PAN_Card.pdf';
                iconBg = '#E6F4EA';
                strokeColor = '#137333';
              } else if (item.category === 'Aadhaar') {
                docTitle = 'Aadhaar Card';
                docDesc = item.name || 'Aadhaar_Front_Back.jpg';
                iconBg = '#E8F0FE';
                strokeColor = '#1A73E8';
              } else if (item.category === 'Bank Statement') {
                docTitle = 'Bank Statement';
                docDesc = item.name || 'Bank_Statement_FY25.pdf';
                iconBg = '#E0F2F1';
                strokeColor = '#00695C';
              } else if (item.category === 'ITR Copy') {
                docTitle = 'Form 16 / Prev ITR';
                docDesc = item.name || 'Form16_2024.pdf';
                iconBg = '#FEE2E2';
                strokeColor = '#EF4444';
              } else if (item.category === 'GST Certificate') {
                docTitle = 'GST Certificate';
                docDesc = item.name || 'GST_Draft.pdf';
                iconBg = '#F3E8FF';
                strokeColor = '#7C3AED';
              }

              // Checklist Icons
              const renderListIcon = () => {
                switch(item.category) {
                  case 'PAN':
                    return (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="2.5">
                        <rect x="3" y="4" width="18" height="16" rx="2" />
                        <circle cx="9" cy="12" r="3" />
                        <path d="M14 9h5M14 13h5M14 17h3" />
                      </svg>
                    );
                  case 'Aadhaar':
                    return (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="2.5">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    );
                  case 'Bank Statement':
                    return (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="2.5">
                        <rect x="3" y="22" width="18" height="2" />
                        <path d="M5 22V10M19 22V10M12 22V10M4 10l8-8 8 8" />
                      </svg>
                    );
                  case 'ITR Copy':
                    return (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="2.5">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                      </svg>
                    );
                  default:
                    return (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="2.5">
                        <line x1="19" y1="5" x2="5" y2="19" />
                        <circle cx="6.5" cy="6.5" r="2.5" fill="none" />
                        <circle cx="17.5" cy="17.5" r="2.5" fill="none" />
                      </svg>
                    );
                }
              };

              // Badge status mapping
              const badge = item.status === 'Approved' ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#E6F4EA', color: '#10B981', padding: '4px 10px', borderRadius: '12px', fontSize: '0.66rem', fontWeight: 800 }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Approved</span>
                </div>
              ) : item.status === 'Rejected' ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#FEE2E2', color: '#EF4444', padding: '4px 10px', borderRadius: '12px', fontSize: '0.66rem', fontWeight: 800 }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                  <span>Rejected</span>
                </div>
              ) : item.status === 'Under Review' ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#FEF3C7', color: '#D97706', padding: '4px 10px', borderRadius: '12px', fontSize: '0.66rem', fontWeight: 800 }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <span>Under Review</span>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#F1F3F4', color: '#5F6368', padding: '4px 10px', borderRadius: '12px', fontSize: '0.66rem', fontWeight: 800 }}>
                  <span>Missing</span>
                </div>
              );

              const isLast = idx === filteredChecklist.length - 1;

              return (
                <div 
                  key={item.category} 
                  style={{ 
                    borderBottom: isLast ? 'none' : '1.5px solid var(--border-color)', 
                    padding: '16px', 
                    display: 'flex', 
                    flexDirection: 'column',
                    backgroundColor: item.status === 'Rejected' ? '#FFF5F5' : 'transparent'
                  }}
                >
                  {/* Main Row */}
                  <div 
                    onClick={() => {
                      const matchedRealDoc = documents.find(d => d.category === item.category);
                      if (matchedRealDoc) {
                        setPreviewDoc(matchedRealDoc);
                      } else {
                        addNotification(`No active file found for ${docTitle}. Please upload first.`, 'info');
                      }
                    }}
                    style={{ display: 'flex', alignItems: 'center', width: '100%', cursor: 'pointer' }}
                  >
                    {/* Icon Badge */}
                    <div 
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '10px',
                        backgroundColor: iconBg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      {renderListIcon()}
                    </div>

                    {/* Title & Desc details */}
                    <div style={{ flex: 1, marginLeft: '12px', minWidth: 0 }}>
                      <h5 style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                        {docTitle}
                      </h5>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', display: 'block', marginTop: '2px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        {docDesc}
                      </span>
                    </div>

                    {/* Status Badge + Chevron right */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '8px' }}>
                      {badge}
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </div>
                  </div>

                  {/* Additional details for Rejected Status */}
                  {item.status === 'Rejected' && (
                    <div style={{ paddingLeft: '50px', display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--error)', fontWeight: 600, fontStyle: 'normal' }}>
                        Reason: {item.reason || "Illegible scan, please re-upload"}
                      </span>
                      <button 
                        onClick={() => {
                          triggerCameraScan(item.category);
                        }}
                        style={{
                          border: '1.5px solid var(--error)',
                          color: 'var(--error)',
                          background: 'transparent',
                          padding: '6px 12px',
                          borderRadius: '10px',
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          width: 'fit-content',
                          cursor: 'pointer',
                          transition: 'all var(--transition-fast)'
                        }}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                          <circle cx="12" cy="13" r="4"/>
                        </svg>
                        Re-capture & Upload
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* What Happens Next Card */}
      <div 
        className="card"
        style={{
          backgroundColor: '#F8FAFC',
          borderRadius: '20px',
          border: '1.5px solid rgba(226, 232, 240, 0.8)',
          padding: '16px',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}
      >
        {/* Header Title with Info Icon */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#2563EB' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="16" x2="12" y2="12"/>
            <line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
          <span style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'none' }}>
            What happens next?
          </span>
        </div>

        {/* Triple Column Steps layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', width: '100%', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
          {/* Column 1 */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '6px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'rgba(37, 99, 235, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB', flexShrink: 0 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
              </svg>
            </div>
            <span style={{ fontSize: '0.62rem', color: 'var(--text-secondary)', fontWeight: 600, lineHeight: 1.3 }}>
              Upload required files
            </span>
          </div>

          {/* Column 2 */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '6px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'rgba(37, 99, 235, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB', flexShrink: 0 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <span style={{ fontSize: '0.62rem', color: 'var(--text-secondary)', fontWeight: 600, lineHeight: 1.3 }}>
              Optional files later
            </span>
          </div>

          {/* Column 3 */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '6px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'rgba(37, 99, 235, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB', flexShrink: 0 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <span style={{ fontSize: '0.62rem', color: 'var(--text-secondary)', fontWeight: 600, lineHeight: 1.3 }}>
              Expert continues once files are in
            </span>
          </div>
        </div>
      </div>

      {/* Document Preview Modal */}
      {previewDoc && (
        <div 
          onClick={() => setPreviewDoc(null)}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999,
            padding: '24px',
            backdropFilter: 'blur(4px)',
            width: '100%',
            height: '100%'
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="animate-scale-in card"
            style={{
              width: '100%',
              maxWidth: '320px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              backgroundColor: 'var(--bg-phone)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 className="title-accent" style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>Preview</h4>
              <button 
                onClick={() => setPreviewDoc(null)}
                aria-label="Close file preview"
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', color: 'var(--text-secondary)' }}
              >
                ✕
              </button>
            </div>

            {/* Document Mock View */}
            <div 
              style={{
                height: '160px',
                borderRadius: '12px',
                backgroundColor: 'var(--bg-surface-variant)',
                border: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: '8px',
                position: 'relative'
              }}
            >
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-primary)', maxWidth: '200px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                {previewDoc.name}
              </span>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', position: 'absolute', bottom: '10px' }}>
                🔒 AES-256 ENCRYPTED
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Status:</span>
                <span style={{ fontWeight: 800, color: getStatusColor(previewDoc.status) }}>{previewDoc.status}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Category:</span>
                <span style={{ fontWeight: 700 }}>{previewDoc.category}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Uploaded:</span>
                <span>{previewDoc.date}</span>
              </div>
              {previewDoc.reason && (
                <div style={{ marginTop: '4px', padding: '8px', borderRadius: '8px', backgroundColor: 'var(--error-container)', color: 'var(--on-error)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                  <strong>Reject Reason:</strong> {previewDoc.reason}
                </div>
              )}
            </div>

            <button 
              className="btn btn-primary" 
              onClick={() => {
                addNotification('Downloading copy to local storage...', 'success');
                setPreviewDoc(null);
              }}
              style={{ background: 'var(--secondary)' }}
            >
              Download
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  permOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px'
  },
  permCard: {
    width: '100%',
    maxWidth: '290px',
    backgroundColor: '#FFFFFF',
    borderRadius: '24px',
    padding: '24px 20px',
    boxShadow: '0 12px 30px rgba(0,0,0,0.25)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    border: 'none'
  },
  permIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    backgroundColor: '#EFF6FF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.4rem',
    marginBottom: '16px'
  },
  permTitle: {
    fontSize: '0.94rem',
    fontWeight: 700,
    color: '#1A1A2E',
    margin: '0 0 20px 0',
    lineHeight: 1.4
  },
  permButtonCol: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    borderRadius: '16px',
    border: '1.5px solid #F1F3F4',
    overflow: 'hidden'
  },
  permBtn: {
    padding: '14px',
    fontSize: '0.82rem',
    fontWeight: 700,
    color: '#0D9488',
    width: '100%',
    textAlign: 'center',
    borderBottom: '1.5px solid #F1F3F4',
    backgroundColor: '#FFFFFF',
    cursor: 'pointer'
  }
};
