import { useState, useEffect, useCallback } from 'react';
import QRCode from 'qrcode';
import { supabase, mapLocationFromRow, BUCKET_QR, getPublicUrl } from '../lib/supabase';

/**
 * Hook pengurusan lokasi & kod QR via Supabase.
 */
export function useLocations() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchLocations = useCallback(async () => {
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error loading locations:', error);
      setLoading(false);
      return;
    }
    setLocations((data || []).map(mapLocationFromRow));
    setLoading(false);
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchLocations();

    const channel = supabase
      .channel('locations-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'locations' }, () => {
        fetchLocations();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchLocations]);

  const addLocation = async (name, slugId, cafeteriaId = 'kafeteria-utama') => {
    const sanitizedId = slugId.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '-');
    if (locations.some((l) => l.id === sanitizedId)) {
      throw new Error('LOCATION_EXISTS');
    }

    const qrUrl = `${window.location.origin}/aduan?loc=${sanitizedId}`;
    const qrDataUrl = await QRCode.toDataURL(qrUrl, { width: 350, margin: 2 });
    const response = await fetch(qrDataUrl);
    const blob = await response.blob();

    const filePath = `${sanitizedId}.png`;
    const { error: uploadError } = await supabase.storage
      .from(BUCKET_QR)
      .upload(filePath, blob, { contentType: 'image/png', upsert: true });

    if (uploadError) throw uploadError;

    const downloadUrl = getPublicUrl(BUCKET_QR, filePath);

    const { error: insertError } = await supabase.from('locations').insert({
      id: sanitizedId,
      name: name.trim(),
      qr_code_url: downloadUrl,
      active: true,
      cafeteria_id: cafeteriaId,
    });

    if (insertError) throw insertError;
    await fetchLocations();
    return sanitizedId;
  };

  const toggleLocationStatus = async (loc) => {
    const { error } = await supabase
      .from('locations')
      .update({ active: !loc.active })
      .eq('id', loc.id);

    if (error) throw error;
    setLocations((prev) =>
      prev.map((l) => (l.id === loc.id ? { ...l, active: !loc.active } : l))
    );
  };

  return { locations, loading, addLocation, toggleLocationStatus };
}

export default useLocations;
