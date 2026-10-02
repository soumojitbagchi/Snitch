import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Navbar from "../../../components/Navbar.jsx";
import { getMe, updateProfile } from "../../auth/services/auth.api.js";
import { selectAuth, setUser } from "../../redux/auth.slice.jsx";
import { COUNTRIES, normalizeCountry } from "../../payment/UI/deliveryEstimate.js";

const emptyAddress = () => ({
  label: "Home",
  recipientName: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "India",
});

const inputClass = "mt-1.5 h-11 w-full border border-neutral-300 bg-white px-3 text-sm text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 focus:border-black focus-visible:outline-2 focus-visible:outline-black";

function initialsFor(name) {
  return String(name || "Guest")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function ProfileAvatar({ user }) {
  const [imageFailed, setImageFailed] = useState(false);

  if (user?.avatar && !imageFailed) {
    return (
      <img
        src={user.avatar}
        alt={`${user.fullname || "Your"} profile`}
        onError={() => setImageFailed(true)}
        className="h-28 w-28 rounded-full border-4 border-white object-cover shadow-md ring-1 ring-neutral-200 sm:h-32 sm:w-32"
      />
    );
  }

  return (
    <div aria-label="Profile picture" className="grid h-28 w-28 place-items-center rounded-full border-4 border-white bg-neutral-900 text-3xl font-medium tracking-wide text-white shadow-md ring-1 ring-neutral-200 sm:h-32 sm:w-32">
      {initialsFor(user?.fullname)}
    </div>
  );
}

export default function ProfilePage() {
  const dispatch = useDispatch();
  const { user } = useSelector(selectAuth);
  const [form, setForm] = useState(() => ({
    fullname: user?.fullname || "",
    contact: user?.contact || "",
    addresses: user?.addresses || [],
  }));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const loadProfile = async () => {
      try {
        const data = await getMe();
        if (cancelled) return;
        dispatch(setUser(data.user));
        setForm({
          fullname: data.user.fullname || "",
          contact: data.user.contact || "",
          addresses: data.user.addresses || [],
        });
      } catch {
        if (!cancelled) {
          setError("We could not load your account details. Please refresh and try again.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    loadProfile();
    return () => {
      cancelled = true;
    };
  }, [dispatch]);

  useEffect(() => {
    if (loading && window.location.hash) return;
    const sectionId = window.location.hash.slice(1);
    if (sectionId) {
      document.getElementById(decodeURIComponent(sectionId))?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [loading]);

  const setField = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const setAddress = (index, field, value) => setForm((current) => ({
    ...current,
    addresses: current.addresses.map((address, addressIndex) => (
      addressIndex === index ? { ...address, [field]: value } : address
    )),
  }));
  const addAddress = () => setForm((current) => ({ ...current, addresses: [...current.addresses, emptyAddress()] }));
  const removeAddress = (index) => setForm((current) => ({
    ...current,
    addresses: current.addresses.filter((_, addressIndex) => addressIndex !== index),
  }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const data = await updateProfile(form);
      dispatch(setUser(data.user));
      setForm({
        fullname: data.user.fullname || "",
        contact: data.user.contact || "",
        addresses: data.user.addresses || [],
      });
      setNotice("Your account details are saved.");
    } catch (requestError) {
      setError(requestError.response?.data?.error || "Your changes could not be saved. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <Navbar />
      <main aria-busy={loading} className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
        <header className="flex flex-col items-center border-b border-neutral-200 pb-8 text-center">
          <ProfileAvatar user={user} />
          <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-500">Your account</p>
          <h1 className="mt-1 font-serif text-3xl font-light tracking-tight sm:text-4xl">{user?.fullname || "Your profile"}</h1>
          <p className="mt-1.5 text-sm text-neutral-600">{user?.email || "Manage your personal details"}</p>
          <p className="mt-3 inline-flex border border-neutral-200 bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-600">{(user?.role!=='buyer')?'seller':''}</p>
        </header>

        {loading ? (
          <div role="status" className="mt-8 border border-neutral-200 bg-white px-5 py-10 text-center text-sm text-neutral-500">Loading your profile…</div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <section id="account-settings" className="scroll-mt-28 border border-neutral-200 bg-white">
              <div className="border-b border-neutral-200 px-5 py-4 sm:px-6">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-500">Account settings</p>
                <h2 className="mt-1 text-lg font-semibold tracking-tight">Personal details</h2>
                <p className="mt-1 text-sm leading-5 text-neutral-600">Keep your contact information ready for checkout.</p>
              </div>
              <div className="space-y-4 px-5 py-5 sm:px-6">
                <label className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-700">Full name
                  <input required value={form.fullname} onChange={(event) => setField("fullname", event.target.value)} className={inputClass} autoComplete="name" />
                </label>
                <label className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-700">Email address
                  <input value={user?.email || ""} disabled className={`${inputClass} cursor-not-allowed border-neutral-200 bg-neutral-100 text-neutral-500`} autoComplete="email" />
                </label>
                <label className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-700">Phone number
                  <input type="tel" value={form.contact} onChange={(event) => setField("contact", event.target.value)} className={inputClass} placeholder="10-digit mobile number" autoComplete="tel" />
                </label>
              </div>
            </section>

            <section id="saved-addresses" className="scroll-mt-28 border border-neutral-200 bg-white">
              <div className="flex items-center justify-between gap-4 border-b border-neutral-200 px-5 py-4 sm:px-6">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-500">For a faster checkout</p>
                  <h2 className="mt-1 text-lg font-semibold tracking-tight">Delivery addresses</h2>
                </div>
                <button type="button" onClick={addAddress} disabled={form.addresses.length >= 5} className="min-h-10 shrink-0 border border-black px-3 text-[10px] font-semibold uppercase tracking-[0.12em] transition-colors hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:border-neutral-200 disabled:text-neutral-400">Add address</button>
              </div>

              <div className="space-y-4 px-5 py-5 sm:px-6">
                {form.addresses.length === 0 && (
                  <div className="border border-dashed border-neutral-300 px-4 py-7 text-center text-sm leading-6 text-neutral-600">No saved addresses yet. Add one so it is ready at checkout.</div>
                )}
                {form.addresses.map((address, index) => (
                  <fieldset key={address._id || index} className="border border-neutral-200 p-4 sm:p-5">
                    <legend className="px-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-600">{index === 0 ? "Default address" : `Address ${index + 1}`}</legend>
                    <div className="space-y-4">
                      <label className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-700">Label
                        <input value={address.label || ""} onChange={(event) => setAddress(index, "label", event.target.value)} className={inputClass} placeholder="Home" />
                      </label>
                      <label className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-700">Recipient name
                        <input required value={address.recipientName || ""} onChange={(event) => setAddress(index, "recipientName", event.target.value)} className={inputClass} autoComplete="name" />
                      </label>
                      <label className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-700">Address line 1
                        <input required value={address.line1 || ""} onChange={(event) => setAddress(index, "line1", event.target.value)} className={inputClass} autoComplete="address-line1" />
                      </label>
                      <label className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-700">Address line 2 <span className="normal-case tracking-normal text-neutral-400">(optional)</span>
                        <input value={address.line2 || ""} onChange={(event) => setAddress(index, "line2", event.target.value)} className={inputClass} autoComplete="address-line2" />
                      </label>
                      <label className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-700">City
                        <input required value={address.city || ""} onChange={(event) => setAddress(index, "city", event.target.value)} className={inputClass} autoComplete="address-level2" />
                      </label>
                      <label className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-700">State
                        <input required value={address.state || ""} onChange={(event) => setAddress(index, "state", event.target.value)} className={inputClass} autoComplete="address-level1" />
                      </label>
                      <label className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-700">Postal code
                        <input required value={address.postalCode || ""} onChange={(event) => setAddress(index, "postalCode", event.target.value)} className={inputClass} autoComplete="postal-code" />
                      </label>
                      <label className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-700">Country
                        <select value={normalizeCountry(address.country)} onChange={(event) => setAddress(index, "country", event.target.value)} className={inputClass} autoComplete="country-name">
                          {COUNTRIES.map((entry) => (
                            <option key={entry.code} value={entry.code}>
                              {entry.name}
                            </option>
                          ))}
                          <option value="OTHER">Other country</option>
                        </select>
                      </label>
                      <label className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-700">Phone
                        <input type="tel" value={address.phone || ""} onChange={(event) => setAddress(index, "phone", event.target.value)} className={inputClass} autoComplete="tel" />
                      </label>
                    </div>
                    <button type="button" onClick={() => removeAddress(index)} className="mt-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-500 underline underline-offset-4 transition-colors hover:text-red-700">Remove address</button>
                  </fieldset>
                ))}
              </div>
            </section>

            <div className="space-y-3 pt-1" aria-live="polite">
              {error && <p role="alert" className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}
              {notice && <p className="border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}</p>}
              <button type="submit" disabled={saving} className="min-h-12 w-full bg-black px-6 text-[11px] font-semibold uppercase tracking-[0.16em] text-white transition-colors hover:bg-neutral-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black disabled:cursor-wait disabled:bg-neutral-400">{saving ? "Saving changes…" : "Save profile"}</button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
