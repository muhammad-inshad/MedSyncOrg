import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const EditHospital = () => {
  const { id } = useParams(); // get id from url
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    hospitalName: "",
    email: "",
    phone: "",
    address: "",
    pincode: "",
    since: "",
    about: "",
    licence: "",
  });

  const [loading, setLoading] = useState(true);

  // Fetch old data
  useEffect(() => {
    const fetchHospital = async () => {
      try {
        const res = await axios.get(`/api/admin/${id}`);

        setFormData({
          hospitalName: res.data.hospitalName,
          email: res.data.email,
          phone: res.data.phone,
          address: res.data.address,
          pincode: res.data.pincode,
          since: res.data.since,
          about: res.data.about || "",
          licence: res.data.licence || "",
        });

        setLoading(false);
      } catch (err) {
        console.error(err);
        alert("Failed to load data");
      }
    };

    fetchHospital();
  }, [id]);

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Submit update
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await axios.put(`/api/admin/${id}`, formData);

      alert("Updated Successfully ✅");
      navigate("/admin/dashboard");

    } catch (err) {
      console.error(err);
      alert("Update failed ❌");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow-lg w-full max-w-lg"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">
          Edit Hospital
        </h2>

        {/* Hospital Name */}
        <input
          type="text"
          name="hospitalName"
          value={formData.hospitalName}
          onChange={handleChange}
          placeholder="Hospital Name"
          className="input"
          required
        />

        {/* Email */}
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
          className="input"
          required
        />

        {/* Phone */}
        <input
          type="text"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="Phone"
          className="input"
          required
        />

        {/* Address */}
        <textarea
          name="address"
          value={formData.address}
          onChange={handleChange}
          placeholder="Address"
          className="input"
          required
        />

        {/* Pincode */}
        <input
          type="text"
          name="pincode"
          value={formData.pincode}
          onChange={handleChange}
          placeholder="Pincode"
          className="input"
          required
        />

        {/* Since */}
        <input
          type="number"
          name="since"
          value={formData.since}
          onChange={handleChange}
          placeholder="Established Year"
          className="input"
          required
        />

        {/* About */}
        <textarea
          name="about"
          value={formData.about}
          onChange={handleChange}
          placeholder="About"
          className="input"
        />

        {/* Licence */}
        <input
          type="text"
          name="licence"
          value={formData.licence}
          onChange={handleChange}
          placeholder="Licence"
          className="input"
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg mt-4 hover:bg-blue-700"
        >
          Update
        </button>
      </form>
    </div>
  );
};

export default EditHospital;
