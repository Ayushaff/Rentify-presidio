import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { BiTrash } from 'react-icons/bi';
import { AddCircleOutline, RemoveCircleOutline } from '@mui/icons-material';
import Footer from '../components/Footer';
import variables from '../styles/variables.scss'; // Assuming you have a variables file for styling
import { categories, types } from '../data';

const UpdateListing = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState('');
  const [type, setType] = useState('');
  const [guestCount, setGuestCount] = useState(1);
  const [bedroomCount, setBedroomCount] = useState(1);
  const [bedCount, setBedCount] = useState(1);
  const [bathroomCount, setBathroomCount] = useState(1);
  const [formLocation, setFormLocation] = useState({
    streetAddress: '',
    aptSuite: '',
    city: '',
    province: '',
    country: '',
  });
  const [formDescription, setFormDescription] = useState({
    highlight: '',
    highlightDesc: '',
    description: '',
    price: '',
  });
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      fetchListingData(id);
    }
  }, [id]);

  const fetchListingData = async (id) => {
    try {
      const response = await axios.get(`/api/listings/${id}`);
      const data = response.data;
      setCategory(data.category);
      setType(data.type);
      setGuestCount(data.guestCount);
      setBedroomCount(data.bedroomCount);
      setBedCount(data.bedCount);
      setBathroomCount(data.bathroomCount);
      setFormLocation({
        streetAddress: data.streetAddress,
        aptSuite: data.aptSuite,
        city: data.city,
        province: data.province,
        country: data.country,
      });
      setFormDescription({
        highlight: data.highlight,
        highlightDesc: data.highlightDesc,
        description: data.description,
        price: data.price,
      });
      setPhotos(data.photos);
    } catch (error) {
      console.error('Error fetching listing data:', error);
    }
  };

  const handleChangeLocation = (e) => {
    const { name, value } = e.target;
    setFormLocation((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleChangeDescription = (e) => {
    const { name, value } = e.target;
    setFormDescription((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUploadPhotos = (e) => {
    setPhotos([...photos, ...Array.from(e.target.files)]);
  };

  const handleRemovePhoto = (index) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDragPhoto = (result) => {
    if (!result.destination) return;
    const reorderedPhotos = Array.from(photos);
    const [movedPhoto] = reorderedPhotos.splice(result.source.index, 1);
    reorderedPhotos.splice(result.destination.index, 0, movedPhoto);
    setPhotos(reorderedPhotos);
  };

  const handlePost = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const listingData = {
      category,
      type,
      guestCount,
      bedroomCount,
      bedCount,
      bathroomCount,
      ...formLocation,
      ...formDescription,
      photos,
    };

    try {
      if (id) {
        await axios.put(`/api/listings/${id}`, listingData);
      } else {
        await axios.post('/api/listings', listingData);
      }
      navigate('/listings');
    } catch (error) {
      setError('Failed to save listing');
      console.error('Error saving listing:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="container">
        <form onSubmit={handlePost}>
          <div className="create-listing_step1">
            <h2>Step 1: Basic Info</h2>
            <hr />
            <div className="category-list">
              {categories?.map((item, index) => (
                <div
                  className={`category-list_item ${
                    category === item.title ? 'selected' : ''
                  }`}
                  key={index}
                  onClick={() => setCategory(item.title)}
                >
                  <img src={item.icon} alt={item.title} />
                  <span>{item.title}</span>
                </div>
              ))}
            </div>
            <hr />
            <div className="row">
              <div className="col">
                <h3>What type of place will guests have?</h3>
                <div className="place-type">
                  {types?.map((item, index) => (
                    <div
                      className={`place-type_item ${
                        type === item.title ? 'selected' : ''
                      }`}
                      key={index}
                      onClick={() => setType(item.title)}
                    >
                      <span>{item.title}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="col">
                <h3>Where is your place located?</h3>
                <input
                  type="text"
                  name="streetAddress"
                  value={formLocation.streetAddress}
                  placeholder="Street address"
                  onChange={handleChangeLocation}
                />
                <input
                  type="text"
                  name="aptSuite"
                  value={formLocation.aptSuite}
                  placeholder="Apt, Suite (optional)"
                  onChange={handleChangeLocation}
                />
                <input
                  type="text"
                  name="city"
                  value={formLocation.city}
                  placeholder="City"
                  onChange={handleChangeLocation}
                />
                <input
                  type="text"
                  name="province"
                  value={formLocation.province}
                  placeholder="State/Province"
                  onChange={handleChangeLocation}
                />
                <input
                  type="text"
                  name="country"
                  value={formLocation.country}
                  placeholder="Country"
                  onChange={handleChangeLocation}
                />
              </div>
            </div>
          </div>
          <div className="create-listing_step2">
            <h2>Step 2: Describe your place</h2>
            <hr />
            <div className="row">
              <div className="col">
                <h3>How many guests would you like to welcome?</h3>
                <div className="number-counter">
                  <RemoveCircleOutline
                    style={{
                      fontSize: '1.7rem',
                      color: guestCount === 1 ? 'lightgray' : variables.primary,
                      cursor: guestCount === 1 ? 'not-allowed' : 'pointer',
                    }}
                    onClick={() =>
                      setGuestCount((count) => (count === 1 ? 1 : count - 1))
                    }
                  />
                  <span>{guestCount}</span>
                  <AddCircleOutline
                    style={{
                      fontSize: '1.7rem',
                      color: variables.primary,
                      cursor: 'pointer',
                    }}
                    onClick={() => setGuestCount((count) => count + 1)}
                  />
                </div>
              </div>
              <div className="col">
                <h3>How many bedrooms can guests use?</h3>
                <div className="number-counter">
                  <RemoveCircleOutline
                    style={{
                      fontSize: '1.7rem',
                      color:
                        bedroomCount === 1 ? 'lightgray' : variables.primary,
                      cursor: bedroomCount === 1 ? 'not-allowed' : 'pointer',
                    }}
                    onClick={() =>
                      setBedroomCount((count) => (count === 1 ? 1 : count - 1))
                    }
                  />
                  <span>{bedroomCount}</span>
                  <AddCircleOutline
                    style={{
                      fontSize: '1.7rem',
                      color: variables.primary,
                      cursor: 'pointer',
                    }}
                    onClick={() => setBedroomCount((count) => count + 1)}
                  />
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col">
                <h3>How many beds can guests use?</h3>
                <div className="number-counter">
                  <RemoveCircleOutline
                    style={{
                      fontSize: '1.7rem',
                      color: bedCount === 1 ? 'lightgray' : variables.primary,
                      cursor: bedCount === 1 ? 'not-allowed' : 'pointer',
                    }}
                    onClick={() =>
                      setBedCount((count) => (count === 1 ? 1 : count - 1))
                    }
                  />
                  <span>{bedCount}</span>
                  <AddCircleOutline
                    style={{
                      fontSize: '1.7rem',
                      color: variables.primary,
                      cursor: 'pointer',
                    }}
                    onClick={() => setBedCount((count) => count + 1)}
                  />
                </div>
              </div>
              <div className="col">
                <h3>How many bathrooms can guests use?</h3>
                <div className="number-counter">
                  <RemoveCircleOutline
                    style={{
                      fontSize: '1.7rem',
                      color:
                        bathroomCount === 1 ? 'lightgray' : variables.primary,
                      cursor: bathroomCount === 1 ? 'not-allowed' : 'pointer',
                    }}
                    onClick={() =>
                      setBathroomCount((count) => (count === 1 ? 1 : count - 1))
                    }
                  />
                  <span>{bathroomCount}</span>
                  <AddCircleOutline
                    style={{
                      fontSize: '1.7rem',
                      color: variables.primary,
                      cursor: 'pointer',
                    }}
                    onClick={() => setBathroomCount((count) => count + 1)}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="create-listing_step3">
            <h2>Step 3: Upload Photos</h2>
            <hr />
            <div className="upload-photos">
              <input type="file" multiple onChange={handleUploadPhotos} />
              <DragDropContext onDragEnd={handleDragPhoto}>
                <Droppable droppableId="photos">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="photo-grid"
                    >
                      {photos.map((photo, index) => (
                        <Draggable
                          key={photo.name}
                          draggableId={photo.name}
                          index={index}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="photo-item"
                            >
                              <img
                                src={URL.createObjectURL(photo)}
                                alt={photo.name}
                              />
                              <button
                                type="button"
                                onClick={() => handleRemovePhoto(index)}
                              >
                                <BiTrash />
                              </button>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </div>
          </div>
          <div className="create-listing_step4">
            <h2>Step 4: Describe your place</h2>
            <hr />
            <textarea
              name="highlight"
              value={formDescription.highlight}
              placeholder="Highlight"
              onChange={handleChangeDescription}
            />
            <textarea
              name="highlightDesc"
              value={formDescription.highlightDesc}
              placeholder="Highlight Description"
              onChange={handleChangeDescription}
            />
            <textarea
              name="description"
              value={formDescription.description}
              placeholder="Description"
              onChange={handleChangeDescription}
            />
            <input
              type="text"
              name="price"
              value={formDescription.price}
              placeholder="Price per night"
              onChange={handleChangeDescription}
            />
          </div>
          {error && <p className="error">{error}</p>}
          <button type="submit" disabled={loading}>
            {loading ? 'Saving...' : id ? 'Update Listing' : 'Create Listing'}
          </button>
        </form>
      </div>
      <Footer />
    </>
  );
};

export default UpdateListing;
