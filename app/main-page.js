'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Eye, Edit, Camera, Map, List, Settings, Upload, Layers, Navigation } from 'lucide-react';

export default function MiningSignTracker() {
  // Load data from sessionStorage on startup
  const loadFromStorage = (key, defaultValue) => {
    if (typeof window === 'undefined') return defaultValue;
    try {
      const saved = sessionStorage.getItem(key);
      return saved ? JSON.parse(saved) : defaultValue;
    } catch {
      return defaultValue;
    }
  };

  // Save data to sessionStorage
  const saveToStorage = (key, data) => {
    if (typeof window === 'undefined') return;
    try {
      sessionStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.log('Storage kaydetme hatası:', error);
    }
  };

  // State management with storage
  const [activeTab, setActiveTab] = useState('map');
  const [signTypes, setSignTypes] = useState(() => loadFromStorage('signTypes', [
    { id: 1, name: 'Hız Limiti 30', image: null, description: 'Yol hız sınırı levhası' },
    { id: 2, name: 'Dikkat İş Makinası', image: null, description: 'İş makinası uyarı levhası' },
    { id: 3, name: 'Cep Telefonu Yasak', image: null, description: 'Güvenlik bölgesi levhası' }
  ]));
  
  const [signs, setSigns] = useState(() => loadFromStorage('signs', [
    { 
      id: 1, 
      signTypeId: 1, 
      lat: 39.7600, 
      lng: 29.1850, 
      placedBy: 'Ahmet Yılmaz', 
      placedDate: '2024-07-25',
      status: 'İyi',
      photo: null
    },
    { 
      id: 2, 
      signTypeId: 2, 
      lat: 39.7610, 
      lng: 29.1870, 
      placedBy: 'Mehmet Kaya', 
      placedDate: '2024-07-24',
      status: 'Hasarlı',
      photo: null
    },
    { 
      id: 3, 
      signTypeId: 3, 
      lat: 39.7590, 
      lng: 29.1830, 
      placedBy: 'Ali Demir', 
      placedDate: '2024-07-23',
      status: 'İyi',
      photo: null
    },
    { 
      id: 4, 
      signTypeId: 1, 
      lat: 39.7620, 
      lng: 29.1890, 
      placedBy: 'Fatma Şahin', 
      placedDate: '2024-07-22',
      status: 'Kayıp',
      photo: null
    }
  ]));

  const [tifLayers, setTifLayers] = useState(() => loadFromStorage('tifLayers', [
    { id: 1, name: 'Saha Görüntüsü - Temmuz 2024', url: null, visible: true, opacity: 0.8, uploadDate: '2024-07-20' },
    { id: 2, name: 'Saha Görüntüsü - Haziran 2024', url: null, visible: false, opacity: 0.8, uploadDate: '2024-06-15' }
  ]));
  
  const [mapSettings, setMapSettings] = useState({
    center: [39.7600, 29.1850],
    zoom: 17,
    showSatellite: false
  });

  const [newSignType, setNewSignType] = useState({ name: '', description: '', image: null });
  const [imagePreview, setImagePreview] = useState(null);
  const [newSign, setNewSign] = useState({ 
    signTypeId: '', 
    lat: '', 
    lng: '', 
    placedBy: '', 
    photo: null 
  });
  const [userLocation, setUserLocation] = useState(null);
  const [newTifLayer, setNewTifLayer] = useState({ name: '', file: null, processing: false });
  const [selectedSign, setSelectedSign] = useState(null);

  // Auto-save to storage when data changes
  useEffect(() => {
    saveToStorage('signTypes', signTypes);
  }, [signTypes]);

  useEffect(() => {
    saveToStorage('signs', signs);
  }, [signs]);

  useEffect(() => {
    saveToStorage('tifLayers', tifLayers);
  }, [tifLayers]);

  // Get user location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          setNewSign(prev => ({ ...prev, lat: latitude, lng: longitude }));
        },
        (error) => {
          alert('Konum alınamadı. Lütfen konum erişimini açın.');
        }
      );
    }
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      setNewSignType(prev => ({ ...prev, image: file }));
    }
  };

  // Add new sign type
  const addSignType = () => {
    if (newSignType.name.trim()) {
      const newId = Math.max(...signTypes.map(s => s.id), 0) + 1;
      const signTypeWithImage = {
        ...newSignType,
        id: newId,
        image: imagePreview
      };
      setSignTypes([...signTypes, signTypeWithImage]);
      setNewSignType({ name: '', description: '', image: null });
      setImagePreview(null);
      alert('Levha tipi eklendi!');
    }
  };

  // Add new sign
  const addSign = () => {
    if (newSign.signTypeId && newSign.lat && newSign.lng && newSign.placedBy) {
      const newId = Math.max(...signs.map(s => s.id), 0) + 1;
      setSigns([...signs, { 
        ...newSign, 
        id: newId, 
        placedDate: new Date().toISOString().split('T')[0],
        status: 'İyi'
      }]);
      setNewSign({ signTypeId: '', lat: '', lng: '', placedBy: '', photo: null });
      alert('Levha eklendi!');
    }
  };

  // Update sign status
  const updateSignStatus = (signId, newStatus) => {
    setSigns(signs.map(sign => 
      sign.id === signId ? { ...sign, status: newStatus } : sign
    ));
  };

  // Toggle TIF layer visibility
  const toggleTifLayer = (layerId) => {
    setTifLayers(tifLayers.map(layer => 
      layer.id === layerId ? { ...layer, visible: !layer.visible } : layer
    ));
  };

  // Update TIF layer opacity
  const updateTifOpacity = (layerId, opacity) => {
    setTifLayers(tifLayers.map(layer => 
      layer.id === layerId ? { ...layer, opacity } : layer
    ));
  };

  const getSignTypeName = (signTypeId) => {
    const signType = signTypes.find(st => st.id === signTypeId);
    return signType ? signType.name : 'Bilinmeyen Tip';
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'İyi': return 'text-green-600 bg-green-100';
      case 'Hasarlı': return 'text-yellow-600 bg-yellow-100';
      case 'Kayıp': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getMarkerColor = (status) => {
    switch(status) {
      case 'İyi': return 'bg-green-500';
      case 'Hasarlı': return 'bg-yellow-500';
      case 'Kayıp': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  // Simple map component
  const SimpleMap = () => {
    const mapBounds = {
      minLat: 39.7580,
      maxLat: 39.7640,
      minLng: 29.1820,
      maxLng: 29.1900
    };

    const getMarkerPosition = (lat, lng) => {
      const x = ((lng - mapBounds.minLng) / (mapBounds.maxLng - mapBounds.minLng)) * 100;
      const y = ((mapBounds.maxLat - lat) / (mapBounds.maxLat - mapBounds.minLat)) * 100;
      return { left: `${x}%`, top: `${y}%` };
    };

    return (
      <div className="relative w-full h-96 bg-gradient-to-br from-green-100 to-blue-100 rounded-lg border-2 border-gray-300 overflow-hidden">
        {/* Grid Background */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px'
          }}
        />
        
        {/* TIF Layer Overlay with actual image */}
        {tifLayers.filter(layer => layer.visible).map(layer => (
          <div key={layer.id} className="absolute inset-4 rounded border-2 border-dashed border-blue-500 overflow-hidden">
            {layer.url && (
              <img
                src={layer.url}
                alt={layer.name}
                className="w-full h-full object-cover"
                style={{ 
                  opacity: layer.opacity,
                  mixBlendMode: 'multiply'
                }}
                onError={() => {
                  console.log('TIF görüntüsü yüklenemedi, fallback kullanılıyor');
                }}
              />
            )}
            <div 
              className="absolute inset-0"
              style={{
                backgroundColor: `rgba(59, 130, 246, ${layer.opacity * 0.2})`,
                pointerEvents: 'none'
              }}
            />
            <div className="absolute top-2 left-2 text-xs text-blue-700 font-semibold bg-white px-2 py-1 rounded shadow">
              📸 {layer.name}
            </div>
            {layer.metadata && (
              <div className="absolute bottom-2 left-2 text-xs text-gray-600 bg-white px-2 py-1 rounded shadow">
                {layer.metadata.size} • {layer.metadata.filename}
              </div>
            )}
          </div>
        ))}
        
        {/* Coordinate Labels */}
        <div className="absolute top-2 left-2 text-xs text-gray-600 bg-white px-2 py-1 rounded shadow">
          📍 {mapBounds.maxLat.toFixed(4)}, {mapBounds.minLng.toFixed(4)}
        </div>
        <div className="absolute bottom-2 right-2 text-xs text-gray-600 bg-white px-2 py-1 rounded shadow">
          📍 {mapBounds.minLat.toFixed(4)}, {mapBounds.maxLng.toFixed(4)}
        </div>
        
        {/* Sign Markers */}
        {signs.map(sign => {
          const position = getMarkerPosition(sign.lat, sign.lng);
          return (
            <div
              key={sign.id}
              className={`absolute w-4 h-4 rounded-full border-2 border-white shadow-lg cursor-pointer transform -translate-x-1/2 -translate-y-1/2 ${getMarkerColor(sign.status)} hover:scale-125 transition-transform`}
              style={position}
              onClick={() => setSelectedSign(sign)}
              title={`${getSignTypeName(sign.signTypeId)} - ${sign.status}`}
            />
          );
        })}
        
        {/* Center Marker */}
        <div 
          className="absolute w-3 h-3 bg-blue-600 rounded-full border-2 border-white shadow-lg" 
          style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
          title="Saha Merkezi"
        />
        
        {/* Scale */}
        <div className="absolute bottom-4 left-4 text-xs text-gray-600 bg-white px-2 py-1 rounded shadow">
          Saha Görünümü (UTM: 516689, 4363463)
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4">
        <h1 className="text-xl font-bold">Maden Sahası Levha Takip Sistemi</h1>
        <p className="text-sm opacity-90 mt-1">Açık ocak madeninde trafik ve iş güvenliği levhalarının takip sistemi</p>
      </div>

      {/* Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="flex overflow-x-auto">
          <button
            onClick={() => setActiveTab('map')}
            className={`flex items-center px-4 py-3 text-sm font-medium border-b-2 ${
              activeTab === 'map' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Map className="w-4 h-4 mr-2" />
            Harita
          </button>
          <button
            onClick={() => setActiveTab('add-sign')}
            className={`flex items-center px-4 py-3 text-sm font-medium border-b-2 ${
              activeTab === 'add-sign' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Plus className="w-4 h-4 mr-2" />
            Levha Ekle
          </button>
          <button
            onClick={() => setActiveTab('sign-types')}
            className={`flex items-center px-4 py-3 text-sm font-medium border-b-2 ${
              activeTab === 'sign-types' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Settings className="w-4 h-4 mr-2" />
            Levha Tipleri
          </button>
          <button
            onClick={() => setActiveTab('tif-layers')}
            className={`flex items-center px-4 py-3 text-sm font-medium border-b-2 ${
              activeTab === 'tif-layers' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Layers className="w-4 h-4 mr-2" />
            TIF Katmanları
          </button>
          <button
            onClick={() => setActiveTab('list')}
            className={`flex items-center px-4 py-3 text-sm font-medium border-b-2 ${
              activeTab === 'list' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <List className="w-4 h-4 mr-2" />
            Liste
          </button>
        </div>
      </div>

      <div className="p-4">
        {/* Map View */}
        {activeTab === 'map' && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <h2 className="text-lg font-semibold">Levha Haritası</h2>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">
                    Saha Koordinatları: UTM 35S (516689.90, 4363463.37)
                  </span>
                  <div className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                    💾 Veriler kaydediliyor
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <SimpleMap />
            </div>

            {selectedSign && (
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold">Levha Detayları</h3>
                  <button 
                    onClick={() => setSelectedSign(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-lg">{getSignTypeName(selectedSign.signTypeId)}</h4>
                    <div className="space-y-2 mt-2 text-sm">
                      <p><span className="font-medium">Durum:</span> 
                        <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getStatusColor(selectedSign.status)}`}>
                          {selectedSign.status}
                        </span>
                      </p>
                      <p><span className="font-medium">Yerleştiren:</span> {selectedSign.placedBy}</p>
                      <p><span className="font-medium">Tarih:</span> {selectedSign.placedDate}</p>
                      <p><span className="font-medium">Koordinat:</span> {selectedSign.lat.toFixed(6)}, {selectedSign.lng.toFixed(6)}</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Durum Güncelle
                    </label>
                    <select
                      value={selectedSign.status}
                      onChange={(e) => {
                        updateSignStatus(selectedSign.id, e.target.value);
                        setSelectedSign({...selectedSign, status: e.target.value});
                      }}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="İyi">İyi</option>
                      <option value="Hasarlı">Hasarlı</option>
                      <option value="Kayıp">Kayıp</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-medium mb-3">Levha Durumları</h3>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span>İyi Durumda ({signs.filter(s => s.status === 'İyi').length})</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                  <span>Hasarlı ({signs.filter(s => s.status === 'Hasarlı').length})</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                  <span>Kayıp ({signs.filter(s => s.status === 'Kayıp').length})</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-600 rounded-full mr-2"></div>
                  <span>Saha Merkezi</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Sign */}
        {activeTab === 'add-sign' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Yeni Levha Ekle</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Levha Tipi
                </label>
                <select
                  value={newSign.signTypeId}
                  onChange={(e) => setNewSign({...newSign, signTypeId: parseInt(e.target.value)})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Levha tipi seçin</option>
                  {signTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
                
                {newSign.signTypeId && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    {(() => {
                      const selectedType = signTypes.find(t => t.id === newSign.signTypeId);
                      return selectedType && (
                        <div className="flex items-center space-x-3">
                          {selectedType.image && (
                            <img
                              src={selectedType.image}
                              alt={selectedType.name}
                              className="w-12 h-12 object-cover rounded-lg border"
                            />
                          )}
                          <div>
                            <p className="font-medium text-sm">{selectedType.name}</p>
                            <p className="text-xs text-gray-600">{selectedType.description}</p>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Konum (WGS84)
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    step="any"
                    placeholder="Enlem (39.7600)"
                    value={newSign.lat}
                    onChange={(e) => setNewSign({...newSign, lat: parseFloat(e.target.value)})}
                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <input
                    type="number"
                    step="any"
                    placeholder="Boylam (29.1850)"
                    value={newSign.lng}
                    onChange={(e) => setNewSign({...newSign, lng: parseFloat(e.target.value)})}
                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    onClick={getCurrentLocation}
                    className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
                    title="Mevcut konumu al"
                  >
                    <Navigation className="w-4 h-4" />
                  </button>
                </div>
                {userLocation && (
                  <p className="text-sm text-green-600 mt-2">
                    ✓ Mevcut konum alındı: {userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Yerleştiren Kişi
                </label>
                <input
                  type="text"
                  value={newSign.placedBy}
                  onChange={(e) => setNewSign({...newSign, placedBy: e.target.value})}
                  placeholder="Adınızı girin"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <button
                onClick={addSign}
                disabled={!newSign.signTypeId || !newSign.lat || !newSign.lng || !newSign.placedBy}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Levhayı Ekle
              </button>
            </div>
          </div>
        )}

        {/* Sign Types Management */}
        {activeTab === 'sign-types' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Levha Tipleri Yönetimi</h2>
            
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium mb-3">Yeni Levha Tipi Ekle</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Levha adı"
                  value={newSignType.name}
                  onChange={(e) => setNewSignType({...newSignType, name: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <input
                  type="text"
                  placeholder="Açıklama"
                  value={newSignType.description}
                  onChange={(e) => setNewSignType({...newSignType, description: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Levha Görseli
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="signTypeImage"
                      />
                      <label
                        htmlFor="signTypeImage"
                        className="cursor-pointer flex items-center justify-center w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 transition-colors"
                      >
                        <div className="text-center">
                          <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600">
                            {imagePreview ? 'Görseli değiştir' : 'Görsel yükle'}
                          </p>
                        </div>
                      </label>
                    </div>
                    
                    {imagePreview && (
                      <div className="w-20 h-20 rounded-lg overflow-hidden border-2 border-gray-200">
                        <img
                          src={imagePreview}
                          alt="Önizleme"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>
                
                <button
                  onClick={addSignType}
                  disabled={!newSignType.name.trim()}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Levha Tipi Ekle
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {signTypes.map(type => (
                <div key={type.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex space-x-4">
                      {type.image && (
                        <div className="w-16 h-16 rounded-lg overflow-hidden border-2 border-gray-200 flex-shrink-0">
                          <img
                            src={type.image}
                            alt={type.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <h4 className="font-medium">{type.name}</h4>
                        <p className="text-sm text-gray-600">{type.description}</p>
                        {!type.image && (
                          <p className="text-xs text-gray-400 mt-1">Görsel yok</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TIF Layers Management */}
        {activeTab === 'tif-layers' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">TIF Katman Yönetimi</h2>
              
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium mb-3">Yeni TIF Katmanı Ekle</h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Katman adı (örn: Saha Görüntüsü - Ağustos 2024)"
                    value={newTifLayer.name}
                    onChange={(e) => setNewTifLayer({...newTifLayer, name: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  
                  <div>
                    <input
                      type="file"
                      accept=".tif,.tiff,.geotiff,image/tiff"
                      onChange={(e) => setNewTifLayer({...newTifLayer, file: e.target.files[0]})}
                      className="hidden"
                      id="tifFile"
                    />
                    <label
                      htmlFor="tifFile"
                      className="cursor-pointer flex items-center justify-center w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 transition-colors"
                    >
                      <div className="text-center">
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">
                          {newTifLayer.file ? `Seçilen: ${newTifLayer.file.name}` : 'TIF/GeoTIFF dosyası seçin'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Desteklenen formatlar: .tif, .tiff, .geotiff
                        </p>
                      </div>
                    </label>
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => {
                      if (!newTifLayer.name.trim()) {
                        alert('Lütfen katman adı girin!');
                        return;
                      }
                      
                      if (!newTifLayer.file) {
                        alert('Lütfen TIF dosyası seçin!');
                        return;
                      }
                      
                      const newId = Math.max(...tifLayers.map(l => l.id), 0) + 1;
                      const newLayer = {
                        id: newId,
                        name: newTifLayer.name,
                        url: URL.createObjectURL(newTifLayer.file),
                        bounds: [[39.7580, 29.1820], [39.7640, 29.1900]],
                        metadata: {
                          filename: newTifLayer.file.name,
                          size: (newTifLayer.file.size / 1024 / 1024).toFixed(1) + ' MB',
                          type: newTifLayer.file.type || 'image/tiff'
                        },
                        visible: true,
                        opacity: 0.8,
                        uploadDate: new Date().toISOString().split('T')[0]
                      };
                      
                      setTifLayers([...tifLayers, newLayer]);
                      setNewTifLayer({ name: '', file: null, processing: false });
                      alert('TIF katmanı başarıyla eklendi! Harita sekmesine gidin.');
                    }}
                    disabled={!newTifLayer.name.trim() || !newTifLayer.file}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    TIF Katmanı Ekle
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-medium">Mevcut TIF Katmanları</h3>
                {tifLayers.map(layer => (
                  <div key={layer.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h4 className="font-medium">{layer.name}</h4>
                        <p className="text-sm text-gray-600">Yükleme: {layer.uploadDate}</p>
                        {layer.metadata && (
                          <div className="text-xs text-gray-500 mt-1 space-y-1">
                            <p>📁 {layer.metadata.filename}</p>
                            <p>📏 {layer.metadata.size}</p>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={layer.visible}
                            onChange={() => toggleTifLayer(layer.id)}
                            className="mr-2"
                          />
                          <span className="text-sm">Görünür</span>
                        </label>
                      </div>
                    </div>
                    
                    {layer.visible && (
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Şeffaflık: {Math.round(layer.opacity * 100)}%
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={layer.opacity}
                          onChange={(e) => updateTifOpacity(layer.id, parseFloat(e.target.value))}
                          className="w-full"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Signs List */}
        {activeTab === 'list' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Levha Listesi</h2>
            
            <div className="space-y-3">
              {signs.map(sign => (
                <div key={sign.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">{getSignTypeName(sign.signTypeId)}</h4>
                    <select
                      value={sign.status}
                      onChange={(e) => updateSignStatus(sign.id, e.target.value)}
                      className={`px-3 py-1 rounded-full text-xs border-0 ${getStatusColor(sign.status)}`}
                    >
                      <option value="İyi">İyi</option>
                      <option value="Hasarlı">Hasarlı</option>
                      <option value="Kayıp">Kayıp</option>
                    </select>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>📍 {sign.lat.toFixed(6)}, {sign.lng.toFixed(6)}</p>
                    <p>👤 {sign.placedBy}</p>
                    <p>📅 {sign.placedDate}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}