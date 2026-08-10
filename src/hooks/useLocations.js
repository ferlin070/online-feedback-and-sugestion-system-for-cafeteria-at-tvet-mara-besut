import { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import QRCode from 'qrcode';
import { db, storage } from '../firebase';

/**
 * Hook pengurusan lokasi & kod QR.
 */
export function useLocations() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const locationsColRef = collection(db, 'locations');
    const unsubscribe = onSnapshot(locationsColRef, (snapshot) => {
      const locs = [];
      snapshot.forEach((d) => {
        locs.push({ id: d.id, ...d.data() });
      });
      setLocations(locs);
      setLoading(false);
    }, (err) => {
      console.error('Error listening to locations:', err);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const addLocation = async (name, slugId) => {
    const sanitizedId = slugId.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '-');
    const exists = locations.some(l => l.id === sanitizedId);
    if (exists) {
      throw new Error('LOCATION_EXISTS');
    }

    const qrUrl = `${window.location.origin}/aduan?loc=${sanitizedId}`;
    const qrDataUrl = await QRCode.toDataURL(qrUrl, { width: 350, margin: 2 });
    const response = await fetch(qrDataUrl);
    const blob = await response.blob();

    const qrStorageRef = ref(storage, `qr_codes/${sanitizedId}.png`);
    await uploadBytes(qrStorageRef, blob, { contentType: 'image/png' });
    const downloadUrl = await getDownloadURL(qrStorageRef);

    const locDocRef = doc(db, 'locations', sanitizedId);
    await setDoc(locDocRef, {
      id: sanitizedId,
      name: name.trim(),
      qrCodeUrl: downloadUrl,
      active: true,
      createdAt: serverTimestamp()
    });
    return sanitizedId;
  };

  const toggleLocationStatus = async (loc) => {
    const locRef = doc(db, 'locations', loc.id);
    await updateDoc(locRef, { active: !loc.active });
  };

  return { locations, loading, addLocation, toggleLocationStatus };
}
