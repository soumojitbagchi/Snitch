import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Navbar from "../../../components/Navbar.jsx";
import { getMe, updateProfile } from "../../auth/services/auth.api.js";
import { selectAuth, setUser } from "../../redux/auth.slice.jsx";

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

export default function ProfilePage() {
  const dispatch = useDispatch();
  const { user } = useSelector(selectAuth);
  const [form, setForm] = useState({ fullname: "", contact: "", addresses: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await getMe();
        dispatch(setUser(data.user));
        setForm({
          fullname: data.user.fullname || "",
          contact: data.user.contact || "",
          addresses: data.user.addresses || [],
        });
      } catch {
        setError("We could not load your account details. Please refresh and try again.");
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [dispatch]);

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
      setForm({ fullname: data.user.fullname || "", contact: data.user.contact || "", addresses: data.user.addresses || [] });
      setNotice("Account details saved.");
    } catch (requestError) {
      setError(requestError.response?.data?.error || "Your changes could not be saved. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return null;

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
        <header className="border-b border-neutral-200 pb-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-500">Account</p>
          <div className="mt-3 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h1 className="font-serif text-4xl font-light tracking-tight sm:text-5xl">Your profile.</h1>
              <p className="mt-2 max-w-lg text-sm leading-6 text-neutral-600">Keep your contact details and delivery addresses ready for a faster checkout.</p>
            </div>
            <p className="text-sm text-neutral-500">{user?.email}</p>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)]">
          <section>
            <div className="border-t-2 border-black pt-4">
              <h2 className="text-[12px] font-semibold uppercase tracking-[0.18em]">Personal details</h2>
              <p className="mt-2 text-sm leading-6 text-neutral-600">Your email is managed by your sign-in method.</p>
            </div>
            <div className="mt-6 space-y-5">
              <label className="block text-[11px] font-semibold uppercase tracking-[0.15em] text-neutral-700">Full name
                <input required value={form.fullname} onChange={(event) => setField("fullname", event.target.value)} className={inputClass} />
              </label>
              <label className="block text-[11px] font-semibold uppercase tracking-[0.15em] text-neutral-700">Email
                <input value={user?.email || ""} disabled className={`${inputClass} cursor-not-allowed border-neutral-200 bg-neutral-100 text-neutral-500`} />
              </label>
              <label className="block text-[11px] font-semibold uppercase tracking-[0.15em] text-neutral-700">Phone number
                <input type="tel" value={form.contact} onChange={(event) => setField("contact", event.target.value)} className={inputClass} placeholder="10-digit mobile number" />
              </label>
            </div>
          </section>

          <section>
            <div className="flex items-end justify-between gap-4 border-t-2 border-black pt-4">
              <div>
                <h2 className="text-[12px] font-semibold uppercase tracking-[0.18em]">Saved addresses</h2>
                <p className="mt-2 text-sm leading-6 text-neutral-600">The first address is used as your default delivery address.</p>
              </div>
              <button type="button" onClick={addAddress} disabled={form.addresses.length >= 5} className="shrink-0 border border-black px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:border-neutral-200 disabled:text-neutral-400">Add address</button>
            </div>

            <div className="mt-6 space-y-5">
              {form.addresses.length === 0 && (
                <div className="border border-dashed border-neutral-300 px-5 py-8 text-sm leading-6 text-neutral-600">No saved addresses yet. Add one now so it is ready at checkout.</div>
              )}
              {form.addresses.map((address, index) => (
                <fieldset key={address._id || index} className="border border-neutral-200 p-5">
                  <legend className="px-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-700">{index === 0 ? "Default address" : `Address ${index + 1}`}</legend>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="text-[11px] font-semibold uppercase tracking-[0.15em] text-neutral-700">Label
                      <input value={address.label} onChange={(event) => setAddress(index, "label", event.target.value)} className={inputClass} placeholder="Home" />
                    </label>
                    <label className="text-[11px] font-semibold uppercase tracking-[0.15em] text-neutral-700">Recipient name
                      <input required value={address.recipientName} onChange={(event) => setAddress(index, "recipientName", event.target.value)} className={inputClass} />
                    </label>
                    <label className="sm:col-span-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-neutral-700">Address line 1
                      <input required value={address.line1} onChange={(event) => setAddress(index, "line1", event.target.value)} className={inputClass} />
                    </label>
                    <label className="sm:col-span-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-neutral-700">Address line 2 <span className="normal-case tracking-normal text-neutral-400">(optional)</span>
                      <input value={address.line2 || ""} onChange={(event) => setAddress(index, "line2", event.target.value)} className={inputClass} />
                    </label>
                    <label className="text-[11px] font-semibold uppercase tracking-[0.15em] text-neutral-700">City
                      <input required value={address.city} onChange={(event) => setAddress(index, "city", event.target.value)} className={inputClass} />
                    </label>
                    <label className="text-[11px] font-semibold uppercase tracking-[0.15em] text-neutral-700">State
                      <input required value={address.state} onChange={(event) => setAddress(index, "state", event.target.value)} className={inputClass} />
                    </label>
                    <label className="text-[11px] font-semibold uppercase tracking-[0.15em] text-neutral-700">Postal code
                      <input required value={address.postalCode} onChange={(event) => setAddress(index, "postalCode", event.target.value)} className={inputClass} />
                    </label>
                    <label className="text-[11px] font-semibold uppercase tracking-[0.15em] text-neutral-700">Phone
                      <input type="tel" value={address.phone || ""} onChange={(event) => setAddress(index, "phone", event.target.value)} className={inputClass} />
                    </label>
                  </div>
                  <button type="button" onClick={() => removeAddress(index)} className="mt-5 text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500 underline underline-offset-4 transition-colors hover:text-red-700">Remove address</button>
                </fieldset>
              ))}
            </div>
          </section>

          <div className="lg:col-span-2 flex flex-col gap-4 border-t border-neutral-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <div aria-live="polite">
              {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
              {notice && <p className="text-sm text-emerald-700">{notice}</p>}
            </div>
            <button type="submit" disabled={saving} className="min-h-12 bg-black px-6 text-[12px] font-semibold uppercase tracking-[0.16em] text-white transition-colors hover:bg-neutral-800 disabled:cursor-wait disabled:bg-neutral-400">{saving ? "Saving…" : "Save changes"}</button>
          </div>
        </form>
      </main>
    </div>
  );
}
