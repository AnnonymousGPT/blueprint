import { useState, useMemo, useEffect, useRef } from 'react';
import { api } from '../services/apiService';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

const categories = [
  { key: 'All', label: 'All', match: 'All' },
  { key: 'PAN', label: 'PAN', match: 'PAN' },
  { key: 'Aadhaar', label: 'Aadhaar', match: 'Aadhaar' },
  { key: 'GST', label: 'GST', match: 'GST Certificate' },
  { key: 'Bank', label: 'Bank', match: 'Bank Statement' },
  { key: 'ITR', label: 'ITR', match: 'ITR Copy' },
  { key: 'Biz', label: 'Biz', match: 'Business Documents' }
];

export default function Documents({ documents = [], onUploadSuccess, addNotification, setActiveTab, requests }) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [uploading, setUploading] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);
  
  const [showUploadOptions, setShowUploadOptions] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraFlash, setCameraFlash] = useState(false);
  const [cameraCapturedImage, setCameraCapturedImage] = useState(false);
  const [capturedPhotoUrl, setCapturedPhotoUrl] = useState(null);
  
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [cameraPermissionState, setCameraPermissionState] = useState('prompt'); // prompt | granted | denied

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  const [uploadCategory, setUploadCategory] = useState(() => {
    return localStorage.getItem('preselectUploadCategory') || 'PAN';
  });

  const [stagedFile, setStagedFile] = useState(null);

  // Monitor network connection
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Read preselection
    const preselected = localStorage.getItem('preselectUploadCategory');
    if (preselected) {
      setUploadCategory(preselected);
      localStorage.removeItem('preselectUploadCategory');
    }

    trackEvent('document_vault_viewed');

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Safe Capacitor Haptic trigger
  const playHaptic = async (type) => {
    try {
      if (type === 'light') {
        await Haptics.impact({ style: ImpactStyle.Light });
      } else if (type === 'success') {
        await Haptics.notification({ type: NotificationType.Success });
      } else if (type === 'error') {
        await Haptics.notification({ type: NotificationType.Error });
      }
    } catch (e) {
      if (navigator.vibrate) navigator.vibrate(30);
    }
  };

  // Analytics event tracker
  const trackEvent = (eventName, payload = {}) => {
    console.log(`[Analytics] Event: ${eventName}`, payload);
    if (window.gtag) {
      window.gtag('event', eventName, payload);
    }
  };

  const triggerCameraScan = (category) => {
    playHaptic('light');
    setUploadCategory(category);
    setShowCamera(true);
  };

  const triggerFilePick = (category) => {
    playHaptic('light');
    setUploadCategory(category);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleRealFileSelected = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    playHaptic('light');
    setStagedFile({
      realFile: file,
      name: file.name,
      category: uploadCategory,
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`
    });
    trackEvent('document_upload_initiated', { name: file.name, category: uploadCategory });
    addNotification(`${file.name} selected! Confirm to upload.`, 'success');
  };

  useEffect(() => {
    if (showCamera) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then(stream => {
          setCameraPermissionState('granted');
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
          streamRef.current = stream;
        })
        .catch(err => {
          console.error('Error accessing camera:', err);
          setCameraPermissionState('denied');
          addNotification('Camera access failed. Select a local file.', 'error');
        });
    } else {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    }
  }, [showCamera, addNotification]);

  const capturePhoto = () => {
    setCameraFlash(true);
    playHaptic('light');
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
        console.error('Error capturing canvas:', err);
        setCameraCapturedImage(true);
      }
    } else {
      setCameraCapturedImage(true);
    }
  };

  const handleRetake = () => {
    playHaptic('light');
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

  const confirmStagedUpload = async () => {
    if (!stagedFile) return;

    if (isOffline) {
      playHaptic('error');
      addNotification('No Internet Connection. Reconnect to upload.', 'error');
      return;
    }

    setUploading(true);
    playHaptic('light');
    addNotification('Uploading document to secure vault...', 'info');

    const reqId = (requests && requests.length > 0) ? requests[0].id : (localStorage.getItem('activeRequestId') || undefined);

    try {
      const fileToUpload = stagedFile.realFile || { name: stagedFile.name, size: 0 };
      const res = await api.uploadDocument(fileToUpload, stagedFile.category, reqId);
      
      playHaptic('success');
      trackEvent('document_upload_success', { name: stagedFile.name, category: stagedFile.category });
      onUploadSuccess(res.document);
      setStagedFile(null);
      addNotification(`${stagedFile.category} uploaded successfully! ✅`, 'success');
      
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
      playHaptic('error');
      trackEvent('document_upload_failed', { name: stagedFile.name, category: stagedFile.category, error: err.message });
      addNotification(`Upload failed: ${err.message}`, 'error');
    } finally {
      setUploading(false);
    }
  };

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

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved': return 'var(--success)';
      case 'Rejected': return 'var(--error)';
      case 'Under Review': return '#F59E0B';
      default: return 'var(--text-secondary)';
    }
  };

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
    <div className="screen-shell animate-fade-in-up" style={{ gap: '14px', paddingTop: '16px', paddingBottom: '160px', backgroundColor: '#FFFFFF', position: 'relative' }}>
      
      {/* Hidden real file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.pdf,.doc,.docx"
        style={{ display: 'none' }}
        onChange={handleRealFileSelected}
        aria-hidden="true"
      />

      {/* Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        <button 
          onClick={() => {
            playHaptic('light');
            if (setActiveTab) setActiveTab('home');
          }}
          aria-label="Back to home dashboard"
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            border: '1px solid var(--border-color)',
            backgroundColor: 'var(--bg-card)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-primary)',
            cursor: 'pointer'
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <div style={{ textAlign: 'center', flex: 1, padding: '0 8px' }}>
          <h3 className="title-accent" style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            Documents Vault
          </h3>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', display: 'block', marginTop: '2px' }}>
            AES-256 Vault Encryption
          </span>
        </div>

        <div 
          style={{
            border: '1.5px solid rgba(16, 185, 129, 0.3)',
            color: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.06)',
            padding: '8px 14px',
            borderRadius: '12px',
            fontSize: '0.74rem',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer'
          }}
          onClick={() => {
            playHaptic('light');
            addNotification('Filing documents are fully encrypted.', 'success');
          }}
        >
          🔒 Vault
        </div>
      </div>

      {/* Connection Offline Status alert */}
      {isOffline && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          borderRadius: 12,
          padding: '8px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          width: '100%',
          boxSizing: 'border-box'
        }} role="alert">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span style={{ fontSize: '0.72rem', color: '#ef4444', fontWeight: 600 }}>
            Offline Mode — Check network connection to upload files.
          </span>
        </div>
      )}

      {/* Interactive Camera Viewport */}
      {showCamera && (
        <div className="camera-viewfinder" style={{ zIndex: 999 }}>
          {cameraPermissionState === 'denied' ? (
            <div style={{
              margin: 'auto',
              width: '90%',
              backgroundColor: '#FFFFFF',
              borderRadius: '24px',
              padding: '24px 20px',
              textAlign: 'center',
              zIndex: 10
            }}>
              <span style={{ fontSize: '2rem', marginBottom: 12, display: 'block' }}>📷</span>
              <h4 style={{ margin: '0 0 10px', fontSize: '0.94rem', color: '#1a1a2e', fontWeight: 900 }}>Camera Access Denied</h4>
              <p style={{ margin: '0 0 20px', fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                Please allow camera access in your device settings, or select a file directly from your local files.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => triggerFilePick(uploadCategory)}
                  className="btn btn-primary"
                  style={{ minHeight: 44, borderRadius: 10, fontSize: '0.8rem', fontWeight: 800 }}
                >
                  Choose File from Device
                </button>
                <button
                  type="button"
                  onClick={() => {
                    playHaptic('light');
                    setShowCamera(false);
                  }}
                  style={{ minHeight: 44, background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
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

              <div className={`camera-flash-simulation ${cameraFlash ? 'camera-flash-active' : ''}`} style={{ zIndex: 9 }} />
              
              <div className="camera-grid" style={{ zIndex: 2 }}>
                <div style={{ display: 'flex', height: '100%', position: 'absolute', top: 0, left: 0, right: 0 }}>
                  <div style={{ width: '33.3%', borderRight: '1px dashed rgba(255,255,255,0.15)' }} />
                  <div style={{ width: '33.3%', borderRight: '1px dashed rgba(255,255,255,0.15)' }} />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10, width: '100%', padding: '20px 16px 0', boxSizing: 'border-box' }}>
                <button 
                  onClick={() => { setShowCamera(false); setCameraCapturedImage(false); setCapturedPhotoUrl(null); }}
                  style={{ background: 'rgba(0,0,0,0.5)', border: 'none', color: 'white', padding: '8px 14px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#10b981' }}>
                  {uploadCategory} SCANNER
                </span>
                <div style={{ width: '50px' }} />
              </div>

              {!cameraCapturedImage ? (
                <div className="camera-guide-box" style={{ zIndex: 5 }}>
                  <div className="camera-scanline" />
                  <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.7)', fontWeight: 600, textAlign: 'center', padding: '0 16px', zIndex: 10 }}>
                    Align your {uploadCategory} document inside the frame
                  </span>
                </div>
              ) : (
                <div style={{ width: '85%', height: '180px', margin: 'auto', borderRadius: '12px', border: '3px solid #10b981', overflow: 'hidden', zIndex: 5, position: 'relative' }}>
                  {capturedPhotoUrl ? (
                    <img src={capturedPhotoUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Captured document preview" />
                  ) : (
                    <div style={{ width: '100%', height: '100%', backgroundColor: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                      Capturing...
                    </div>
                  )}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center', zIndex: 10, width: '100%', paddingBottom: 24 }}>
                {!cameraCapturedImage ? (
                  <>
                    <button className="camera-shutter-btn" onClick={capturePhoto} aria-label="Shutter Button" />
                  </>
                ) : (
                  <div style={{ display: 'flex', gap: '16px', width: '90%' }}>
                    <button 
                      onClick={handleRetake}
                      style={{ flex: 1, padding: '12px', fontSize: '0.8rem', borderRadius: '10px', backgroundColor: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer' }}
                    >
                      Retake
                    </button>
                    <button 
                      onClick={() => {
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
                        const displayName = realFile?.name || `Camera_Scan_${uploadCategory}.jpg`;
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
                        addNotification('File scan ready. Confirm upload.', 'success');
                      }}
                      style={{ flex: 1, padding: '12px', fontSize: '0.8rem', borderRadius: '10px', backgroundColor: '#10b981', color: 'white', border: 'none', cursor: 'pointer' }}
                    >
                      Use Scan
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* Upload Choice Drawer */}
      {showUploadOptions && (
        <div 
          onClick={() => setShowUploadOptions(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'flex-end',
            zIndex: 998,
            backdropFilter: 'blur(3px)'
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              backgroundColor: 'var(--bg-card)',
              borderRadius: '24px 24px 0 0',
              padding: '24px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              boxSizing: 'border-box'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 style={{ fontSize: '0.92rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>Add {uploadCategory}</h4>
              <button 
                onClick={() => setShowUploadOptions(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', color: 'var(--text-secondary)', padding: 4 }}
              >
                ✕
              </button>
            </div>
            
            <button 
              onClick={() => {
                setShowUploadOptions(false);
                triggerCameraScan(uploadCategory);
              }}
              style={{ padding: '14px', fontSize: '0.85rem', display: 'flex', gap: '10px', justifyContent: 'flex-start', alignItems: 'center', background: 'var(--bg-surface-variant)', border: '1px solid var(--border-color)', borderRadius: '12px', cursor: 'pointer', minHeight: 48 }}
            >
              <span>📷</span> <strong>Scan Document via Camera</strong>
            </button>

            <button 
              onClick={() => {
                setShowUploadOptions(false);
                triggerFilePick(uploadCategory);
              }}
              style={{ padding: '14px', fontSize: '0.85rem', display: 'flex', gap: '10px', justifyContent: 'flex-start', alignItems: 'center', background: 'var(--bg-surface-variant)', border: '1px solid var(--border-color)', borderRadius: '12px', cursor: 'pointer', minHeight: 48 }}
            >
              <span>📁</span> <strong>Upload Local File / PDF</strong>
            </button>
          </div>
        </div>
      )}

      {/* Progress tracker */}
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

        return (
          <div className="card" style={{ display: 'flex', flexDirection: 'column', padding: '16px', borderRadius: '16px', backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', gap: '10px', width: '100%', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: '0.62rem', fontWeight: 800, color: 'var(--text-secondary)' }}>VAULT UPLOAD STATUS</span>
                <h4 style={{ fontSize: '0.86rem', fontWeight: 900, color: 'var(--text-primary)', margin: '2px 0 0' }}>
                  {uploadedCount} of 4 Required Uploads
                </h4>
              </div>
              <span style={{ fontSize: '0.68rem', fontWeight: 800, color: progressPercentage === 100 ? '#10b981' : '#3b82f6' }}>
                {progressPercentage}% Completed
              </span>
            </div>
            <div style={{ width: '100%', height: 6, backgroundColor: 'var(--border-color)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ width: `${progressPercentage}%`, height: '100%', backgroundColor: progressPercentage === 100 ? '#10b981' : '#3b82f6', transition: 'width 0.4s ease' }} />
            </div>
          </div>
        );
      })()}

      {/* Select Destination and Upload cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-secondary)' }}>
          <span>TARGET VAULT CONTAINER</span>
          <select 
            value={uploadCategory}
            onChange={(e) => setUploadCategory(e.target.value)}
            style={{
              border: 'none',
              backgroundColor: 'transparent',
              color: '#3b82f6',
              fontWeight: 800,
              cursor: 'pointer',
              outline: 'none',
              fontSize: '0.68rem'
            }}
          >
            {categories.slice(1).map(cat => (
              <option key={cat.key} value={cat.match}>{cat.label}</option>
            ))}
          </select>
        </div>

        {/* Upload staged block or default placeholders */}
        {!stagedFile ? (
          <div style={{ display: 'grid', gridTemplateColumns: '2.1fr 1fr', gap: '10px', width: '100%' }}>
            <button 
              type="button"
              onClick={handleSelectFileClick}
              disabled={isOffline}
              style={{
                border: '2px dashed #3b82f6',
                borderRadius: '14px',
                padding: '16px 10px',
                textAlign: 'center',
                cursor: isOffline ? 'not-allowed' : 'pointer',
                backgroundColor: 'rgba(59, 130, 246, 0.02)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                minHeight: 100
              }}
            >
              {uploading ? (
                <div className="spinner-circle" style={{ width: 20, height: 20, borderTopColor: 'transparent' }} />
              ) : (
                <>
                  <span style={{ fontSize: '1.4rem' }}>📁</span>
                  <h5 style={{ fontSize: '0.76rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                    Select Device File
                  </h5>
                  <span style={{ fontSize: '0.58rem', color: 'var(--text-secondary)' }}>PDF, Image • Max 10MB</span>
                </>
              )}
            </button>

            <button 
              type="button"
              onClick={() => triggerCameraScan(uploadCategory)}
              style={{
                border: '1px solid var(--border-color)',
                borderRadius: '14px',
                padding: '16px 10px',
                textAlign: 'center',
                cursor: 'pointer',
                backgroundColor: 'var(--bg-card)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                minHeight: 100
              }}
            >
              <span style={{ fontSize: '1.4rem' }}>📷</span>
              <h5 style={{ fontSize: '0.76rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                Scan Card
              </h5>
              <span style={{ fontSize: '0.58rem', color: 'var(--text-secondary)' }}>Via Camera</span>
            </button>
          </div>
        ) : (
          /* Staging Preview Confirmation */
          <div 
            className="card animate-scale-in"
            style={{
              borderColor: '#3b82f6',
              backgroundColor: 'rgba(59, 130, 246, 0.04)',
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              width: '100%',
              boxSizing: 'border-box'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.62rem', fontWeight: 800, color: '#3b82f6' }}>STAGED FILE PREVIEW</span>
              <button 
                type="button"
                onClick={() => setStagedFile(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem', color: 'var(--text-secondary)' }}
              >
                ✕
              </button>
            </div>
            
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {stagedFile.previewUrl ? (
                <img src={stagedFile.previewUrl} style={{ width: '42px', height: '42px', objectFit: 'cover', borderRadius: '6px' }} alt="Staged snapshot" />
              ) : (
                <span style={{ fontSize: '1.5rem' }}>📄</span>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <h5 style={{ fontSize: '0.76rem', fontWeight: 800, color: 'var(--text-primary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', margin: 0 }}>
                  {stagedFile.name}
                </h5>
                <span style={{ fontSize: '0.62rem', color: 'var(--text-secondary)', display: 'block', marginTop: 2 }}>
                  Vault: <strong>{stagedFile.category}</strong> • Size: {stagedFile.size}
                </span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button 
                type="button"
                onClick={() => setStagedFile(null)} 
                style={{ padding: '8px', fontSize: '0.74rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontWeight: 800, cursor: 'pointer' }}
              >
                Replace
              </button>
              <button 
                type="button"
                onClick={confirmStagedUpload} 
                disabled={isOffline}
                style={{ padding: '8px', fontSize: '0.74rem', borderRadius: '8px', border: 'none', background: '#3b82f6', color: '#ffffff', fontWeight: 800, cursor: 'pointer' }}
              >
                Upload
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Filter and Search controls */}
      <div style={{ display: 'flex', gap: 8, width: '100%' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          border: '1px solid var(--border-color)',
          borderRadius: '10px',
          paddingInline: 12,
          backgroundColor: 'var(--bg-card)',
          flex: 1,
          minHeight: 44
        }}>
          <span style={{ color: 'var(--text-secondary)' }}>🔍</span>
          <input 
            type="text" 
            placeholder="Search vault documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              border: 'none',
              outline: 'none',
              fontSize: '0.8rem',
              width: '100%',
              backgroundColor: 'transparent',
              color: 'var(--text-primary)',
              fontWeight: 600
            }}
          />
        </div>
      </div>

      {/* Categories select tabs */}
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', width: '100%', paddingBottom: 2, scrollbarWidth: 'none' }}>
        {categories.map(cat => {
          const isActive = selectedCategory === cat.key;
          return (
            <button
              key={cat.key}
              type="button"
              onClick={() => {
                playHaptic('light');
                setSelectedCategory(cat.key);
              }}
              style={{
                padding: '6px 12px',
                borderRadius: '20px',
                border: isActive ? '1.5px solid #3b82f6' : '1px solid var(--border-color)',
                backgroundColor: isActive ? '#3b82f6' : 'var(--bg-card)',
                color: isActive ? '#ffffff' : 'var(--text-secondary)',
                fontSize: '0.72rem',
                fontWeight: 800,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                minHeight: 32
              }}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Document status list */}
      <section aria-labelledby="status-list-header" style={{ width: '100%' }}>
        <h4 id="status-list-header" style={{ fontSize: '0.76rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px', margin: 0 }}>
          Uploaded Vault Items
        </h4>

        <div className="card" style={{ padding: 0, borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)' }}>
          {filteredChecklist.length === 0 ? (
            <div style={{ padding: '24px 12px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.76rem' }}>
              No document uploads in this category yet.
            </div>
          ) : (
            filteredChecklist.map((item, idx) => {
              const isLast = idx === filteredChecklist.length - 1;
              const hasFile = item.status !== 'Missing';
              const isRejected = item.status === 'Rejected';

              return (
                <div 
                  key={item.category}
                  style={{
                    padding: '12px 14px',
                    borderBottom: isLast ? 'none' : '1px solid var(--border-color)',
                    display: 'flex',
                    flexDirection: 'column',
                    backgroundColor: isRejected ? 'rgba(239, 68, 68, 0.03)' : 'transparent'
                  }}
                >
                  <div 
                    onClick={() => {
                      playHaptic('light');
                      if (hasFile) {
                        const matched = documents.find(d => d.category === item.dbCategory);
                        if (matched) setPreviewDoc(matched);
                      } else {
                        setUploadCategory(item.category);
                        setShowUploadOptions(true);
                      }
                    }}
                    style={{ display: 'flex', alignItems: 'center', width: '100%', cursor: 'pointer' }}
                  >
                    <div style={{ fontSize: '1.4rem', flexShrink: 0 }}>📄</div>
                    <div style={{ flex: 1, minWidth: 0, marginLeft: 10 }}>
                      <h5 style={{ margin: 0, fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-primary)' }}>{item.category}</h5>
                      <span style={{ fontSize: '0.62rem', color: 'var(--text-secondary)', display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', marginTop: 1 }}>
                        {item.name || 'Not Uploaded'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{
                        fontSize: '0.64rem',
                        fontWeight: 800,
                        padding: '3px 8px',
                        borderRadius: 6,
                        backgroundColor: item.status === 'Approved' ? 'rgba(16,185,129,0.08)' : isRejected ? 'rgba(239,68,68,0.08)' : item.status === 'Under Review' ? 'rgba(245,158,11,0.08)' : 'var(--bg-surface-variant)',
                        color: item.status === 'Approved' ? '#10b981' : isRejected ? '#dc2626' : item.status === 'Under Review' ? '#f59e0b' : 'var(--text-secondary)'
                      }}>
                        {item.status}
                      </span>
                      <span style={{ color: 'var(--text-tertiary)' }}>›</span>
                    </div>
                  </div>

                  {isRejected && (
                    <div style={{ paddingLeft: 30, marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <div style={{ fontSize: '0.66rem', color: '#dc2626', fontWeight: 600 }}>Rejection Reason: {item.reason || 'Incorrect file scan'}</div>
                      <button
                        type="button"
                        onClick={() => {
                          playHaptic('light');
                          triggerCameraScan(item.category);
                        }}
                        style={{
                          alignSelf: 'flex-start',
                          padding: '6px 12px',
                          borderRadius: 6,
                          border: '1px solid #dc2626',
                          background: 'none',
                          color: '#dc2626',
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4
                        }}
                      >
                        📷 Rescan File
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Preview Modal overlay */}
      {previewDoc && (
        <div 
          onClick={() => setPreviewDoc(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.55)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 20,
            backdropFilter: 'blur(3px)'
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 320,
              padding: 16,
              background: 'var(--bg-card)',
              borderRadius: 16,
              border: '1px solid var(--border-color)',
              display: 'flex',
              flexDirection: 'column',
              gap: 12
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 style={{ fontSize: '0.86rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>Preview Document</h4>
              <button 
                onClick={() => setPreviewDoc(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', color: 'var(--text-secondary)' }}
              >
                ✕
              </button>
            </div>

            <div style={{
              height: 120,
              backgroundColor: 'var(--bg-surface-variant)',
              borderRadius: 10,
              border: '1px solid var(--border-color)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4
            }}>
              <span style={{ fontSize: '2rem' }}>📄</span>
              <span style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--text-primary)', maxWidth: 200, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                {previewDoc.name}
              </span>
            </div>

            <div style={{ fontSize: '0.72rem', display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Status:</span>
                <span style={{ fontWeight: 800, color: getStatusColor(previewDoc.status) }}>{previewDoc.status}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Category:</span>
                <span style={{ fontWeight: 800 }}>{previewDoc.category}</span>
              </div>
            </div>

            <button 
              type="button" 
              onClick={() => {
                playHaptic('light');
                addNotification('Downloading vault copy...', 'success');
                setPreviewDoc(null);
              }}
              className="btn btn-primary"
              style={{ minHeight: 40, borderRadius: 8, fontSize: '0.76rem', fontWeight: 800 }}
            >
              Download Vault Copy
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
