import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { getStoredAuthToken, storeUserInfo } from "../api/auth";
import { getCurrentUser, updateCurrentUser } from "../api/users";
import { useToast } from "../components/ToastProvider";
import type { UserDTO } from "../data/types";
import "./profile.css";

type ProfileForm = {
  name: string;
  surname: string;
  username: string;
  email: string;
  dateOfBirth: string;
  country: string;
  city: string;
  street: string;
  postal_code: string;
  address: string;
  nat_id: string;
  tax_id: string;
};

const emptyForm: ProfileForm = {
  name: "",
  surname: "",
  username: "",
  email: "",
  dateOfBirth: "",
  country: "",
  city: "",
  street: "",
  postal_code: "",
  address: "",
  nat_id: "",
  tax_id: "",
};

function toForm(user: UserDTO): ProfileForm {
  return {
    name: user.name ?? "",
    surname: user.surname ?? "",
    username: user.username ?? "",
    email: user.email ?? "",
    dateOfBirth: user.dateOfBirth ?? "",
    country: user.country ?? "",
    city: user.city ?? "",
    street: user.street ?? "",
    postal_code: user.postal_code ?? "",
    address: user.address ?? "",
    nat_id: user.nat_id ?? "",
    tax_id: user.tax_id ?? "",
  };
}

function blankToNull(value: string): string | null {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function ProfilePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();
  const [form, setForm] = useState<ProfileForm>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const redirectTarget = searchParams.get("redirect");

  useEffect(() => {
    if (!getStoredAuthToken()) {
      navigate("/login?redirect=profile", { replace: true });
      return;
    }

    const loadProfile = async () => {
      try {
        const user = await getCurrentUser();
        setForm(toForm(user));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    void loadProfile();
  }, [navigate]);

  const updateField = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setError("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.address.trim() || !form.nat_id.trim()) {
      setError("Address and national ID are required for checkout.");
      return;
    }

    setSaving(true);
    try {
      const updated = await updateCurrentUser({
        name: form.name.trim(),
        surname: form.surname.trim(),
        email: form.email.trim(),
        dateOfBirth: blankToNull(form.dateOfBirth),
        country: blankToNull(form.country),
        city: blankToNull(form.city),
        street: blankToNull(form.street),
        postal_code: blankToNull(form.postal_code),
        address: form.address.trim(),
        nat_id: form.nat_id.trim(),
        tax_id: blankToNull(form.tax_id),
      });
      setForm(toForm(updated));
      storeUserInfo(updated.name ?? "", updated.surname ?? "");
      showToast("Profile updated successfully", "success");

      if (redirectTarget === "cart") {
        navigate("/cart");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save profile";
      setError(message);
      showToast(message, "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="profile-page">
        <section className="profile-panel">
          <h1>Loading profile...</h1>
        </section>
      </main>
    );
  }

  return (
    <main className="profile-page">
      <div className="profile-breadcrumb" aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <span>/</span>
        <span>Profile</span>
      </div>

      <section className="profile-header">
        <div>
          <h1>Profile</h1>
          <p>Keep your delivery and identity information ready for checkout.</p>
        </div>
        {redirectTarget === "cart" && (
          <span className="profile-chip">Complete these details to continue checkout</span>
        )}
      </section>

      <form className="profile-panel" onSubmit={handleSubmit}>
        <div className="profile-section-title">
          <h2>Personal Information</h2>
          <span>Fields marked with * are required before checkout.</span>
        </div>

        {error && (
          <p className="profile-error" role="alert">
            {error}
          </p>
        )}

        <div className="profile-grid">
          <label>
            Name
            <input name="name" value={form.name} onChange={updateField} />
          </label>
          <label>
            Surname
            <input name="surname" value={form.surname} onChange={updateField} />
          </label>
          <label>
            Username
            <input name="username" value={form.username} disabled />
          </label>
          <label>
            Email
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={updateField}
            />
          </label>
          <label>
            Date of birth
            <input
              name="dateOfBirth"
              type="date"
              value={form.dateOfBirth}
              onChange={updateField}
            />
          </label>
          <label>
            National ID *
            <input
              name="nat_id"
              value={form.nat_id}
              onChange={updateField}
              required
            />
          </label>
          <label>
            Tax ID
            <input name="tax_id" value={form.tax_id} onChange={updateField} />
          </label>
          <label>
            Country
            <input name="country" value={form.country} onChange={updateField} />
          </label>
          <label>
            City
            <input name="city" value={form.city} onChange={updateField} />
          </label>
          <label>
            Street
            <input name="street" value={form.street} onChange={updateField} />
          </label>
          <label>
            Postal code
            <input
              name="postal_code"
              value={form.postal_code}
              onChange={updateField}
            />
          </label>
          <label className="profile-address">
            Delivery address *
            <textarea
              name="address"
              value={form.address}
              onChange={updateField}
              rows={4}
              required
            />
          </label>
        </div>

        <div className="profile-actions">
          <button type="submit" className="btn-action" disabled={saving}>
            {saving ? "Saving..." : "Save Profile"}
          </button>
          <Link to={redirectTarget === "cart" ? "/cart" : "/"} className="btn-secondary">
            {redirectTarget === "cart" ? "Back to Cart" : "Back to Shop"}
          </Link>
        </div>
      </form>
    </main>
  );
}

export default ProfilePage;
