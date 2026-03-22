import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PhotoGalleryUpload from '../ui/PhotoGalleryUpload';
import Button from '../ui/Button';
import { useAuth } from '../../lib/auth/AuthContext';
import {
  createMarketplaceListing,
  updateMarketplaceListing,
  uploadMarketplaceListingImages,
  deleteMarketplaceListingImage,
  getMarketplaceImagePublicUrl,
} from '../../lib/supabase/marketplaceService';
import {
  MARKETPLACE_SUITABLE_FOR_OPTIONS,
  type MarketplaceCategoryRow,
  type MarketplaceListingType,
  type MarketplacePriceType,
  type MarketplaceCondition,
  type MarketplaceListingWithDetails,
} from '../../lib/types/marketplace';

interface CreateListingFormProps {
  categories: MarketplaceCategoryRow[];
  onSuccess: (listingId: string) => void;
  onCancel?: () => void;
  /** Standard: neue Anzeige */
  mode?: 'create' | 'edit';
  /** Bei mode=edit erforderlich */
  listingId?: string;
  /** Geladene Anzeige (nur edit) */
  initialListing?: MarketplaceListingWithDetails | null;
}

const STEPS = ['Art & Preis', 'Kategorie', 'Details', 'Fotos'];

function CreateListingForm({
  categories,
  onSuccess,
  onCancel,
  mode = 'create',
  listingId: editListingId,
  initialListing,
}: CreateListingFormProps) {
  const { user } = useAuth();
  const isEdit = mode === 'edit' && !!editListingId;

  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [listingType, setListingType] = useState<MarketplaceListingType>('biete');
  const [priceType, setPriceType] = useState<MarketplacePriceType>('festpreis');
  const [categoryId, setCategoryId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [condition, setCondition] = useState<MarketplaceCondition | ''>('');
  const [suitableFor, setSuitableFor] = useState<string[]>([]);
  const [locationZip, setLocationZip] = useState('');
  const [locationCity, setLocationCity] = useState('');
  const [photos, setPhotos] = useState<(string | File)[]>([]);
  const [existingImages, setExistingImages] = useState<{ id: string; storage_path: string }[]>([]);
  const [newPhotos, setNewPhotos] = useState<File[]>([]);
  const [reactivateListing, setReactivateListing] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  useEffect(() => {
    if (!isEdit || !initialListing) return;
    const l = initialListing;

    setListingType(l.listing_type as MarketplaceListingType);
    setPriceType(l.price_type as MarketplacePriceType);
    setCategoryId(l.category_id);
    setTitle(l.title);
    setDescription(l.description);
    setPrice(
      l.price != null && !Number.isNaN(Number(l.price)) ? String(l.price) : ''
    );
    setCondition((l.condition as MarketplaceCondition | null) || '');
    setSuitableFor(l.suitable_for ?? []);
    setLocationZip(l.location_zip ?? '');
    setLocationCity(l.location_city ?? '');
    setReactivateListing(false);

    const sorted = [...(l.images ?? [])].sort((a, b) => a.sort_order - b.sort_order);
    setExistingImages(sorted.map((i) => ({ id: i.id, storage_path: i.storage_path })));
    setNewPhotos([]);
    setPhotos([]);
    setStep(0);
  }, [isEdit, initialListing?.id, initialListing?.updated_at]);

  const effectivePriceType: MarketplacePriceType =
    listingType === 'verschenke' ? 'kostenlos' : priceType;

  const maxNewPhotos = isEdit ? Math.max(0, 6 - existingImages.length) : 6;

  const toggleSuitable = (value: string) => {
    setSuitableFor((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const validateStep = (s: number): string | null => {
    if (s === 1 && !categoryId) return 'Bitte eine Kategorie wählen.';
    if (s === 2) {
      if (title.trim().length < 3) return 'Titel mindestens 3 Zeichen.';
      if (description.trim().length < 10) return 'Beschreibung mindestens 10 Zeichen.';
      if (effectivePriceType === 'festpreis' && listingType !== 'verschenke') {
        const p = parseFloat(price.replace(',', '.'));
        if (Number.isNaN(p) || p < 0) return 'Bitte einen gültigen Preis angeben.';
      }
    }
    return null;
  };

  const handleNext = () => {
    const err = validateStep(step);
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    setStep((x) => Math.min(x + 1, STEPS.length - 1));
  };

  const handleBack = () => {
    setError(null);
    setStep((x) => Math.max(x - 1, 0));
  };

  const removeExistingImage = async (imageId: string) => {
    if (!user?.id) return;
    setError(null);
    setSubmitting(true);
    const { error: err } = await deleteMarketplaceListingImage(imageId, user.id);
    setSubmitting(false);
    if (err) {
      setError(err);
      return;
    }
    setExistingImages((prev) => prev.filter((x) => x.id !== imageId));
  };

  const buildPriceNum = (): number | null => {
    if (effectivePriceType === 'kostenlos' || listingType === 'verschenke') return null;
    const p = parseFloat(price.replace(',', '.'));
    return Number.isNaN(p) ? null : p;
  };

  const handleSubmit = async () => {
    if (!user?.id) {
      setError('Bitte melde dich an.');
      return;
    }
    const err = validateStep(2);
    if (err) {
      setError(err);
      setStep(2);
      return;
    }
    if (!isEdit && !termsAccepted) {
      setError('Bitte stimme den Nutzungsbedingungen zu, bevor du die Anzeige veröffentlichst.');
      return;
    }

    setSubmitting(true);
    setError(null);

    const priceNum = buildPriceNum();

    if (isEdit && editListingId) {
      const patch: Parameters<typeof updateMarketplaceListing>[2] = {
        category_id: categoryId,
        title: title.trim(),
        description: description.trim(),
        price_type: effectivePriceType,
        listing_type: listingType,
        location_city: locationCity.trim() || null,
        location_zip: locationZip.trim() || null,
        condition: condition || null,
        suitable_for: suitableFor,
        price: priceNum,
      };

      if (initialListing?.status === 'draft') {
        patch.status = 'active';
      } else if (
        reactivateListing &&
        (initialListing?.status === 'sold' ||
          initialListing?.status === 'expired' ||
          initialListing?.status === 'inactive')
      ) {
        patch.status = 'active';
      }

      const { error: updErr } = await updateMarketplaceListing(editListingId, user.id, patch);
      if (updErr) {
        setError(updErr);
        setSubmitting(false);
        return;
      }

      if (newPhotos.length > 0) {
        const upErr = await uploadMarketplaceListingImages(user.id, editListingId, newPhotos);
        if (upErr.error) {
          setError(upErr.error);
          setSubmitting(false);
          return;
        }
      }

      setSubmitting(false);
      onSuccess(editListingId);
      return;
    }

    const { data: listing, error: createErr } = await createMarketplaceListing(user.id, {
      category_id: categoryId,
      title: title.trim(),
      description: description.trim(),
      price_type: effectivePriceType,
      listing_type: listingType,
      status: 'draft',
      location_city: locationCity.trim() || null,
      location_zip: locationZip.trim() || null,
      condition: condition || null,
      suitable_for: suitableFor,
      price: priceNum,
      expires_at: null,
    });

    if (createErr || !listing) {
      setError(createErr || 'Anzeige konnte nicht angelegt werden.');
      setSubmitting(false);
      return;
    }

    const files = photos.filter((p): p is File => p instanceof File);
    if (files.length > 0) {
      const upErr = await uploadMarketplaceListingImages(user.id, listing.id, files);
      if (upErr.error) {
        setError(upErr.error);
        setSubmitting(false);
        return;
      }
    }

    const { error: actErr } = await updateMarketplaceListing(listing.id, user.id, {
      status: 'active',
    });
    if (actErr) {
      setError(actErr);
      setSubmitting(false);
      return;
    }

    setSubmitting(false);
    onSuccess(listing.id);
  };

  const showReactivate =
    isEdit &&
    initialListing &&
    (initialListing.status === 'sold' ||
      initialListing.status === 'expired' ||
      initialListing.status === 'inactive');

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <ol className="flex flex-wrap gap-2 border-b border-gray-200 pb-4">
        {STEPS.map((label, i) => (
          <li
            key={label}
            className={`rounded-full px-3 py-1 text-sm font-medium ${
              i === step ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            {i + 1}. {label}
          </li>
        ))}
      </ol>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {step === 0 && (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Nur Zubehör und Produkte für Haustiere — kein Verkauf von Tieren.
          </p>
          <label className="block text-sm font-medium text-gray-700">Ich …</label>
          <div className="flex flex-col gap-2">
            {(
              [
                ['biete', 'biete etwas an'],
                ['suche', 'suche etwas'],
                ['verschenke', 'verschenke etwas'],
              ] as const
            ).map(([value, label]) => (
              <label key={value} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="listingType"
                  checked={listingType === value}
                  onChange={() => setListingType(value)}
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
          {listingType !== 'verschenke' && (
            <>
              <label className="block text-sm font-medium text-gray-700">Preis</label>
              <div className="flex flex-col gap-2">
                {(
                  [
                    ['festpreis', 'Festpreis'],
                    ['verhandelbar', 'Verhandlungsbasis'],
                    ['kostenlos', 'Kostenlos'],
                  ] as const
                ).map(([value, label]) => (
                  <label key={value} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="priceType"
                      checked={priceType === value}
                      onChange={() => setPriceType(value)}
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </>
          )}
          {showReactivate && (
            <label className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm">
              <input
                type="checkbox"
                checked={reactivateListing}
                onChange={(e) => setReactivateListing(e.target.checked)}
                className="mt-0.5"
              />
              <span>
                <strong>Anzeige wieder veröffentlichen</strong> — sie erscheint wieder im Marktplatz
                (Status „aktiv“). Bei Deaktivierung durch tigube gilt: bitte die Hinweise beachten.
              </span>
            </label>
          )}
        </div>
      )}

      {step === 1 && (
        <div>
          <label htmlFor="marketplace-category" className="block text-sm font-medium text-gray-700">
            Kategorie
          </label>
          <select
            id="marketplace-category"
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            <option value="">Bitte wählen …</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div>
            <label htmlFor="m-title" className="block text-sm font-medium text-gray-700">
              Titel
            </label>
            <input
              id="m-title"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
            />
          </div>
          <div>
            <label htmlFor="m-desc" className="block text-sm font-medium text-gray-700">
              Beschreibung
            </label>
            <textarea
              id="m-desc"
              rows={6}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          {effectivePriceType === 'festpreis' && listingType !== 'verschenke' && (
            <div>
              <label htmlFor="m-price" className="block text-sm font-medium text-gray-700">
                Preis (€)
              </label>
              <input
                id="m-price"
                type="text"
                inputMode="decimal"
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
          )}
          <div>
            <span className="block text-sm font-medium text-gray-700">Zustand (optional)</span>
            <select
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
              value={condition}
              onChange={(e) => setCondition((e.target.value || '') as MarketplaceCondition | '')}
            >
              <option value="">—</option>
              <option value="neu">Neu</option>
              <option value="wie_neu">Wie neu</option>
              <option value="gut">Gut</option>
              <option value="akzeptabel">Akzeptabel</option>
            </select>
          </div>
          <fieldset>
            <legend className="text-sm font-medium text-gray-700">Geeignet für (optional)</legend>
            <div className="mt-2 flex flex-wrap gap-3">
              {MARKETPLACE_SUITABLE_FOR_OPTIONS.map((opt) => (
                <label key={opt.value} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={suitableFor.includes(opt.value)}
                    onChange={() => toggleSuitable(opt.value)}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </fieldset>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="m-plz" className="block text-sm font-medium text-gray-700">
                PLZ (optional)
              </label>
              <input
                id="m-plz"
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                value={locationZip}
                onChange={(e) => setLocationZip(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="m-city" className="block text-sm font-medium text-gray-700">
                Ort (optional)
              </label>
              <input
                id="m-city"
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                value={locationCity}
                onChange={(e) => setLocationCity(e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6">
          {isEdit ? (
            <>
              <div>
                <p className="mb-2 text-sm font-medium text-gray-700">Aktuelle Fotos</p>
                {existingImages.length === 0 ? (
                  <p className="text-sm text-gray-500">Noch keine Fotos.</p>
                ) : (
                  <ul className="flex flex-wrap gap-3">
                    {existingImages.map((img) => (
                      <li key={img.id} className="relative">
                        <img
                          src={getMarketplaceImagePublicUrl(img.storage_path)}
                          alt=""
                          className="h-24 w-24 rounded-lg border border-gray-200 object-cover"
                        />
                        <button
                          type="button"
                          className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-red-600 text-sm font-bold text-white shadow hover:bg-red-700"
                          onClick={() => void removeExistingImage(img.id)}
                          disabled={submitting}
                          aria-label="Foto entfernen"
                        >
                          ×
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div>
                {maxNewPhotos > 0 ? (
                  <>
                    <p className="mb-2 text-sm text-gray-600">
                      Weitere Fotos (max. {maxNewPhotos} Stück, insgesamt max. 6).
                    </p>
                    <PhotoGalleryUpload
                      photos={newPhotos}
                      onPhotosChange={(next) =>
                        setNewPhotos(next.filter((p): p is File => p instanceof File))
                      }
                      maxPhotos={maxNewPhotos}
                      uploading={submitting}
                    />
                  </>
                ) : (
                  <p className="text-sm text-gray-500">
                    Maximal 6 Fotos erreicht. Entferne ein Bild oben, um neue hochzuladen.
                  </p>
                )}
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-gray-600">Bis zu 6 Fotos (optional, JPG/PNG bis 10 MB).</p>
              <PhotoGalleryUpload
                photos={photos}
                onPhotosChange={setPhotos}
                maxPhotos={6}
                uploading={submitting}
              />
            </>
          )}
        </div>
      )}

      {/* Nutzungsbedingungen-Checkbox nur im Create-Modus auf dem letzten Schritt */}
      {!isEdit && step === STEPS.length - 1 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 shrink-0 accent-primary-600"
              checked={termsAccepted}
              onChange={(e) => {
                setTermsAccepted(e.target.checked);
                if (error) setError(null);
              }}
            />
            <span className="text-sm text-gray-700 leading-relaxed">
              Ich habe die{' '}
              <Link
                to="/marktplatz/nutzungsbedingungen"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary-600 underline hover:text-primary-800"
              >
                Nutzungsbedingungen des tigube-Marktplatzes
              </Link>{' '}
              gelesen und stimme diesen für diese Anzeige ausdrücklich zu. Ich bestätige
              insbesondere, dass meine Anzeige{' '}
              <strong>keine lebenden Tiere</strong> und keine verbotenen Inhalte enthält.
            </span>
          </label>
        </div>
      )}

      <div className="flex flex-wrap gap-3 pt-4">
        {step > 0 && (
          <Button type="button" variant="outline" onClick={handleBack} disabled={submitting}>
            Zurück
          </Button>
        )}
        {step < STEPS.length - 1 && (
          <Button type="button" onClick={handleNext} disabled={submitting}>
            Weiter
          </Button>
        )}
        {step === STEPS.length - 1 && (
          <Button
            type="button"
            onClick={() => void handleSubmit()}
            isLoading={submitting}
            disabled={!isEdit && !termsAccepted}
          >
            {isEdit ? 'Änderungen speichern' : 'Anzeige veröffentlichen'}
          </Button>
        )}
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel} disabled={submitting}>
            Abbrechen
          </Button>
        )}
      </div>
    </div>
  );
}

export default CreateListingForm;
