import React, { useState, useEffect, useRef } from 'react';
import { db } from '../../firebase';
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';

export default function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState(null);
  const [actionConfirm, setActionConfirm] = useState({ isOpen: false, message: '' });
  const [alertModal, setAlertModal] = useState({ isOpen: false, message: '', type: 'error' });

  const [editMode, setEditMode] = useState(false);
  const [currentServiceId, setCurrentServiceId] = useState(null);
  
  const [newService, setNewService] = useState({ name: '', category: 'Cabello', price: '', description: '', imageURL: '' });
  const [filterCategory, setFilterCategory] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');

  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const snap = await getDocs(collection(db, 'services'));
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setServices(list);
    } catch (e) {
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImageFile(e.target.files[0]);
      const previewUrl = URL.createObjectURL(e.target.files[0]);
      setNewService(prev => ({ ...prev, imageURL: previewUrl }));
    }
  };

  const openCreateModal = () => {
    setEditMode(false);
    setNewService({ name: '', category: 'Cabello', price: '', description: '', imageURL: '' });
    setImageFile(null);
    setIsModalOpen(true);
  };

  const openEditModal = (service) => {
    setEditMode(true);
    setCurrentServiceId(service.id);
    setNewService({ name: service.name, category: service.category, price: service.price, description: service.description, imageURL: service.imageURL || '' });
    setImageFile(null);
    setIsModalOpen(true);
  };

  const confirmDelete = (service) => {
    setServiceToDelete(service);
    setIsDeleteModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!newService.name || !newService.price) {
      setAlertModal({ isOpen: true, message: 'Completa los campos obligatorios.', type: 'error' });
      return;
    }
    setActionConfirm({ isOpen: true, message: `¿Estás seguro de ${editMode ? 'actualizar' : 'crear'} este servicio?` });
  };

  const executeSave = async () => {
    setActionConfirm({ isOpen: false });
    setUploading(true);

    let finalImageUrl = newService.imageURL;
    if (imageFile) {
      try {
        const formData = new FormData();
        formData.append("file", imageFile);
        formData.append("upload_preset", "milay_beauty");
        
        const res = await fetch("https://api.cloudinary.com/v1_1/dxhniwnof/image/upload", {
          method: "POST",
          body: formData
        });
        const data = await res.json();
        if (data.secure_url) {
          finalImageUrl = data.secure_url;
        }
      } catch (err) {
        console.error("Error al subir imagen:", err);
        setAlertModal({ isOpen: true, message: 'No se pudo subir la imagen, se guardará sin ella o con la anterior.', type: 'warning' });
      }
    }

    const serviceDataToSave = { ...newService, imageURL: finalImageUrl };

    try {
      if (editMode && currentServiceId) {
        if (typeof currentServiceId === 'string' && currentServiceId.length > 10) {
          await updateDoc(doc(db, 'services', currentServiceId), serviceDataToSave);
        }
        setServices(services.map(s => s.id === currentServiceId ? { ...s, ...serviceDataToSave } : s));
      } else {
        const addedRef = await addDoc(collection(db, 'services'), serviceDataToSave);
        setServices([...services, { id: addedRef.id, ...serviceDataToSave }]);
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving service:", error);
      if (editMode) {
        setServices(services.map(s => s.id === currentServiceId ? { ...s, ...serviceDataToSave } : s));
      } else {
        setServices([...services, { id: Date.now().toString(), ...serviceDataToSave }]);
      }
      setIsModalOpen(false);
    } finally {
      setUploading(false);
    }
  };

  const executeDelete = async () => {
    try {
      if (typeof serviceToDelete.id === 'string' && serviceToDelete.id.length > 10) {
        await deleteDoc(doc(db, 'services', serviceToDelete.id));
      }
      setServices(services.filter(s => s.id !== serviceToDelete.id));
      setIsDeleteModalOpen(false);
      setServiceToDelete(null);
    } catch (error) {
      console.error("Error deleting service:", error);
      setServices(services.filter(s => s.id !== serviceToDelete.id));
      setIsDeleteModalOpen(false);
    }
  };

  if (loading) return <div style={{ padding: '32px' }}>Cargando servicios...</div>;

  const categories = ['Todos', 'Cabello', 'Uñas', 'Faciales', 'Pedicura'];
  const filteredServices = services.filter(s => {
    const matchesCategory = filterCategory === 'Todos' || s.category === filterCategory;
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <h3 className="font-display" style={{ fontSize: '24px', color: 'var(--deep)', fontWeight: 500 }}>Servicios</h3>
        <button className="btn-primary" onClick={openCreateModal}>
          <span className="material-symbols-outlined">add</span> Agregar Servicio
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: '1 1 300px', position: 'relative' }}>
          <span className="material-symbols-outlined" style={{ position: 'absolute', left: 0, bottom: '10px', fontSize: '18px', color: 'var(--smoke)' }}>search</span>
          <input 
            type="text" 
            placeholder="Buscar servicio por nombre..." 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)}
            style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: '1px solid var(--mist)', padding: '10px 0 10px 28px', outline: 'none', fontSize: '14px', fontFamily: '"Plus Jakarta Sans", sans-serif', color: 'var(--charcoal)' }}
          />
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {categories.map(cat => (
            <button 
              key={cat}
              className={`pill ${filterCategory === cat ? 'active' : ''}`}
              onClick={() => setFilterCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {categories.filter(c => c !== 'Todos').map((cat, catIndex) => {
        const catServices = filteredServices.filter(s => s.category === cat);
        if (catServices.length === 0) return null;

        return (
          <div key={cat} style={{ marginBottom: '36px' }}>
            <div className="ornament" style={{ marginBottom: '24px' }}>{cat}</div>
            <div className="grid-3 animate-up">
              {catServices.map((service, idx) => (
                <div className="service-card" key={service.id} style={{ display: 'flex', flexDirection: 'column' }}>
                  {idx === 0 && cat === 'Cabello' ? (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px', height: '100%' }}>
                      <div style={{ padding: '28px' }}>
                        <span className="badge badge-dark" style={{ marginBottom: '16px' }}>Destacado</span>
                        <h3 className="font-display" style={{ fontSize: '20px', color: 'var(--deep)', marginBottom: '8px', fontWeight: 500 }}>{service.name}</h3>
                        <p style={{ fontSize: '13px', color: 'var(--smoke)', lineHeight: 1.6, marginBottom: '16px' }}>{service.description}</p>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                          <p className="font-display" style={{ fontSize: '24px', color: 'var(--dusty)', fontWeight: 500 }}>L{service.price}</p>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button className="icon-btn" style={{ width: '30px', height: '30px' }} onClick={() => openEditModal(service)}><span className="material-symbols-outlined" style={{ fontSize: '16px' }}>edit</span></button>
                            <button className="icon-btn" style={{ width: '30px', height: '30px', color: '#ba1a1a' }} onClick={() => confirmDelete(service)}><span className="material-symbols-outlined" style={{ fontSize: '16px' }}>delete</span></button>
                          </div>
                        </div>
                      </div>
                      <div style={{ background: 'var(--blush)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Bodoni Moda", serif', fontSize: '48px', fontStyle: 'italic', color: 'var(--rose)', overflow: 'hidden' }}>
                        {service.imageURL ? <img src={service.imageURL} alt={service.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : service.name.charAt(0)}
                      </div>
                    </div>
                  ) : (
                    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', height: '100%' }}>
                      {service.imageURL ? (
                        <img src={service.imageURL} alt={service.name} style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '8px', marginBottom: '12px' }} />
                      ) : (
                        <span className="material-symbols-outlined" style={{ color: 'var(--rose)', marginBottom: '12px', display: 'block' }}>
                          {cat === 'Cabello' ? 'content_cut' : cat === 'Uñas' ? 'pan_tool' : 'face'}
                        </span>
                      )}
                      <h4 className="font-display" style={{ fontSize: '17px', color: 'var(--deep)', marginBottom: '6px', fontWeight: 500 }}>{service.name}</h4>
                      <p style={{ fontSize: '12px', color: 'var(--smoke)', marginBottom: '16px', lineHeight: 1.5 }}>{service.description}</p>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                        <p style={{ fontSize: '16px', fontWeight: 700, color: 'var(--dusty)' }}>L{service.price}</p>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button className="icon-btn" style={{ width: '30px', height: '30px' }} onClick={() => openEditModal(service)}><span className="material-symbols-outlined" style={{ fontSize: '16px' }}>edit</span></button>
                          <button className="icon-btn" style={{ width: '30px', height: '30px', color: '#ba1a1a' }} onClick={() => confirmDelete(service)}><span className="material-symbols-outlined" style={{ fontSize: '16px' }}>delete</span></button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* MODAL CREAR / EDITAR */}
      {isModalOpen && (
        <div className="overlay open" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 110 }}>
          <div className="card" style={{ width: '100%', maxWidth: '400px', margin: '0 20px', animation: 'fadeUp 0.3s forwards', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 className="font-display" style={{ fontSize: '20px', color: 'var(--deep)', marginBottom: '24px', fontWeight: 500 }}>{editMode ? 'Editar Servicio' : 'Nuevo Servicio'}</h3>
            <form onSubmit={handleSave}>
              <div className="field">
                <label>Foto del Servicio</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '60px', height: '60px', borderRadius: '8px', background: 'var(--mist)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {newService.imageURL ? (
                      <img src={newService.imageURL} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span className="material-symbols-outlined" style={{ color: 'var(--smoke)' }}>image</span>
                    )}
                  </div>
                  <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} style={{ display: 'none' }} />
                  <button type="button" className="btn-secondary" style={{ padding: '8px 12px', fontSize: '10px' }} onClick={() => fileInputRef.current.click()}>Subir Foto</button>
                </div>
              </div>

              <div className="field">
                <label>Nombre del Servicio</label>
                <input type="text" value={newService.name} onChange={(e) => setNewService({ ...newService, name: e.target.value })} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="field">
                  <label>Precio (L)</label>
                  <input type="number" value={newService.price} onChange={(e) => setNewService({ ...newService, price: e.target.value })} required />
                </div>
                <div className="field">
                  <label>Categoría</label>
                  <select value={newService.category} onChange={(e) => setNewService({ ...newService, category: e.target.value })}>
                    <option>Cabello</option>
                    <option>Uñas</option>
                    <option>Faciales</option>
                    <option>Pedicura</option>
                  </select>
                </div>
              </div>
              <div className="field">
                <label>Descripción</label>
                <textarea rows="3" value={newService.description} onChange={(e) => setNewService({ ...newService, description: e.target.value })}></textarea>
              </div>
              
              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }} disabled={uploading}>
                  {uploading ? 'Subiendo...' : editMode ? 'Guardar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRMATION 2-STEP */}
      {actionConfirm.isOpen && (
        <div className="overlay open" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 120 }}>
          <div className="card" style={{ width: '100%', maxWidth: '360px', margin: '0 20px', textAlign: 'center', animation: 'fadeUp 0.3s forwards' }}>
            <div style={{ width: '60px', height: '60px', background: 'var(--mist)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '30px', color: 'var(--deep)' }}>help</span>
            </div>
            <h3 className="font-display" style={{ fontSize: '20px', color: 'var(--deep)', marginBottom: '12px' }}>¿Confirmar Acción?</h3>
            <p style={{ fontSize: '13px', color: 'var(--smoke)', marginBottom: '24px' }}>{actionConfirm.message}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button className="btn-primary" style={{ width: '100%' }} onClick={executeSave}>Sí, confirmar</button>
              <button className="btn-secondary" style={{ width: '100%' }} onClick={() => setActionConfirm({ isOpen: false, message: '' })}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM */}
      {isDeleteModalOpen && (
        <div className="overlay open" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 120 }}>
          <div className="card" style={{ width: '100%', maxWidth: '360px', margin: '0 20px', textAlign: 'center', animation: 'fadeUp 0.3s forwards' }}>
            <div style={{ width: '60px', height: '60px', background: '#ffebee', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '30px', color: '#ba1a1a' }}>warning</span>
            </div>
            <h3 className="font-display" style={{ fontSize: '20px', color: 'var(--deep)', marginBottom: '12px' }}>¿Eliminar Servicio?</h3>
            <p style={{ fontSize: '13px', color: 'var(--smoke)', marginBottom: '24px' }}>Estás a punto de eliminar <strong>{serviceToDelete?.name}</strong>. Esta acción no se puede deshacer.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button className="btn-primary" style={{ width: '100%', background: '#ba1a1a' }} onClick={executeDelete}>Sí, eliminar</button>
              <button className="btn-secondary" style={{ width: '100%' }} onClick={() => setIsDeleteModalOpen(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
      {/* CUSTOM ALERT MODAL */}
      {alertModal.isOpen && (
        <div className="overlay open" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 130 }}>
          <div className="card" style={{ width: '100%', maxWidth: '320px', margin: '0 20px', textAlign: 'center', animation: 'fadeUp 0.3s forwards', borderTop: alertModal.type === 'error' ? '4px solid #ba1a1a' : alertModal.type === 'success' ? '4px solid #4caf50' : '4px solid #f57f17' }}>
            <div style={{ marginBottom: '16px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '36px', color: alertModal.type === 'error' ? '#ba1a1a' : alertModal.type === 'success' ? '#388e3c' : '#f57f17' }}>
                {alertModal.type === 'error' ? 'error' : alertModal.type === 'success' ? 'check_circle' : 'warning'}
              </span>
            </div>
            <h3 className="font-display" style={{ fontSize: '18px', color: 'var(--deep)', marginBottom: '12px' }}>
              {alertModal.type === 'error' ? 'Error' : alertModal.type === 'success' ? '¡Éxito!' : 'Atención'}
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--smoke)', marginBottom: '24px', lineHeight: 1.5 }}>{alertModal.message}</p>
            <button className="btn-primary" style={{ width: '100%' }} onClick={() => setAlertModal({ isOpen: false, message: '', type: 'error' })}>Entendido</button>
          </div>
        </div>
      )}
    </>
  );
}
