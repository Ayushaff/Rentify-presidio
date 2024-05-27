import "../styles/UpdateListing.scss";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { categories, types, facilities } from "../data";
import { RemoveCircleOutline, AddCircleOutline } from "@mui/icons-material";
import variables from "../styles/variables.scss";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { IoIosImages } from "react-icons/io";
import { useState, useEffect } from "react";
import { BiTrash } from "react-icons/bi";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { baseUrl } from "../api/api";
import { Button } from "@mui/material";

const UpdateListing = () => {
  const [listingPhotoPaths, setListingPhotoPaths] = useState([]);
  const { listingId } = useParams();
  const [category, setCategory] = useState("");
  const [type, setType] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  // const listings = useSelector((state) => state.listings);
  const [listing, setListing] = useState(null);

  const [guestCount, setGuestCount] = useState(1);
  const [bedroomCount, setBedroomCount] = useState(1);
  const [bedCount, setBedCount] = useState(1);
  const [bathroomCount, setBathroomCount] = useState(1);

  const [amenities, setAmenities] = useState([]);

  const [photos, setPhotos] = useState([]);

  const [formLocation, setFormLocation] = useState({
    streetAddress: "",
    aptSuite: "",
    city: "",
    province: "",
    country: "",
  });

  const [formDescription, setFormDescription] = useState({
    title: "",
    description: "",
    highlight: "",
    highlightDesc: "",
    price: 0,
  });

  const creatorId = useSelector((state) => state.user._id);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchListingData = async () => {
      try {
        const response = await axios.get(`${baseUrl}/listings/${listingId}`);
        const data = response.data;
        setListingPhotoPaths(data.listingPhotoPaths);
        setListing(data);
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
          title: data.title,
          highlight: data.highlight,
          highlightDesc: data.highlightDesc,
          description: data.description,
          price: data.price,
        });
        const amenitiesArray = data.amenities[0]?.split(",") || [];
        setAmenities(amenitiesArray);
        // setPhotos(data.photos);
      } catch (error) {
        console.error("Error fetching listing data:", error);
      }
    };

    fetchListingData();
  }, [listingId]);

  const handleDeletePresentPhoto = async (photoPath) => {
    try {
      const response = await axios.delete(
        `${baseUrl}/listings/delete-photo/${listingId}`,
        {
          data: { photoPath },
        }
      );

      if (response.status === 200) {
        // Remove the deleted photo from the listingPhotoPaths
        setListingPhotoPaths((prevPaths) =>
          prevPaths.filter((path) => path !== photoPath)
        );
      } else {
        setError("Failed to delete photo, please try again");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleChangeLocation = (e) => {
    const { name, value } = e.target;
    setFormLocation({
      ...formLocation,
      [name]: value,
    });
  };
  const handleSelectAmenities = (facility) => {
    if (amenities.includes(facility)) {
      const newAmenities = amenities.filter((option) => option !== facility);
      setAmenities(newAmenities);
    } else {
      const newAmenities = [...amenities, facility];
      setAmenities(newAmenities);
    }
  };
  console.log(amenities);

  const handleUploadPhotos = (e) => {
    const newPhotos = e.target.files;
    setPhotos((prevPhotos) => [...prevPhotos, ...newPhotos]);
  };
  const handleDragPhoto = (result) => {
    if (!result.destination) return;

    const items = Array.from(photos);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setPhotos(items);
  };

  const handleRemovePhoto = (indexToRemove) => {
    setPhotos((prevPhotos) =>
      prevPhotos.filter((_, index) => index !== indexToRemove)
    );
  };

  const handleChangeDescription = (e) => {
    const { name, value } = e.target;
    setFormDescription({
      ...formDescription,
      [name]: value,
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      const listingForm = new FormData();
      listingForm.append("creator", creatorId);
      listingForm.append("category", category);
      listingForm.append("type", type);
      listingForm.append("streetAddress", formLocation.streetAddress);
      listingForm.append("aptSuite", formLocation.aptSuite);
      listingForm.append("city", formLocation.city);
      listingForm.append("province", formLocation.province);
      listingForm.append("country", formLocation.country);
      listingForm.append("guestCount", guestCount);
      listingForm.append("bedroomCount", bedroomCount);
      listingForm.append("bedCount", bedCount);
      listingForm.append("bathroomCount", bathroomCount);
      listingForm.append("amenities", amenities.join(","));
      listingForm.append("title", formDescription.title);
      listingForm.append("description", formDescription.description);
      listingForm.append("highlight", formDescription.highlight);
      listingForm.append("highlightDesc", formDescription.highlightDesc);
      listingForm.append("price", formDescription.price);

      listingPhotoPaths.forEach((photoPath) => {
        listingForm.append("listingPhotos", photoPath);
        console.log("photoPath:", photoPath);
      });
      // Append new photos to FormData
      photos.forEach((photo) => {
        listingForm.append("listingPhotos", photo);
        console.log("photo:", photo);
      });
      // Append other form data to FormData
      // ...

      setLoading(true);

      const response = await axios.put(
        `${baseUrl}/listings/update/${listingId}`,
        listingForm
      );

      if (response.status === 200) {
        navigate("/");
        setLoading(false);
      } else {
        setError("Failed to update listing, please try again");
        setLoading(false);
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="update-listing">
        <h1>Update Your Listing</h1>
        <form onSubmit={handleUpdate}>
          <div className="update-listing_step1">
            <h2>Step 1: Tell us about your place</h2>
            <hr />
            <h3>Which of these categories best describes your place?</h3>
            <div className="category-list">
              {categories?.map((item, index) => (
                <div
                  className={`category ${
                    category === item.label ? "selected" : ""
                  }`}
                  key={index}
                  onClick={() => setCategory(item.label)}
                >
                  <div className="category_icon">{item.icon}</div>
                  <p>{item.label}</p>
                </div>
              ))}
            </div>

            <h3>What type of place will buyer have?</h3>
            <div className="type-list">
              {types?.map((item, index) => (
                <div
                  className={`type ${type === item.name ? "selected" : ""}`}
                  key={index}
                  onClick={() => setType(item.name)}
                >
                  <div className="type_text">
                    <h4>{item.name}</h4>
                    <p>{item.description}</p>
                  </div>
                  <div className="type_icon">{item.icon}</div>
                </div>
              ))}
            </div>

            <h3>Where's your place located?</h3>
            <div className="full">
              <div className="location">
                <p>Street Address</p>
                <input
                  type="text"
                  placeholder="Street Address"
                  name="streetAddress"
                  value={formLocation.streetAddress}
                  onChange={handleChangeLocation}
                  required
                />
              </div>
            </div>

            <div className="half">
              <div className="location">
                <p>Apartment, Suite, etc. (if applicable)</p>
                <input
                  type="text"
                  placeholder="Apartment, Suite, etc. (if applicable)"
                  name="aptSuite"
                  value={formLocation.aptSuite}
                  onChange={handleChangeLocation}
                />
              </div>
              <div className="location">
                <p>City</p>
                <input
                  type="text"
                  placeholder="City"
                  name="city"
                  value={formLocation.city}
                  onChange={handleChangeLocation}
                  required
                />
              </div>
            </div>

            <div className="half">
              <div className="location">
                <p>Province</p>
                <input
                  type="text"
                  placeholder="Province"
                  name="province"
                  value={formLocation.province}
                  onChange={handleChangeLocation}
                  required
                />
              </div>
              <div className="location">
                <p>Country</p>
                <input
                  type="text"
                  placeholder="Country"
                  name="country"
                  value={formLocation.country}
                  onChange={handleChangeLocation}
                  required
                />
              </div>
            </div>

            <h3>How many guests would you like to welcome?</h3>
            <div className="basics">
              <div className="basic">
                <h4>Guests</h4>
                <div className="basic_count">
                  <RemoveCircleOutline
                    onClick={() =>
                      setGuestCount((prev) => Math.max(prev - 1, 1))
                    }
                    sx={{
                      fontSize: "25px",
                      cursor: "pointer",
                      "&:hover": { color: variables.pinkred },
                    }}
                  />
                  <span>{guestCount}</span>
                  <AddCircleOutline
                    onClick={() => setGuestCount((prev) => prev + 1)}
                    className="basic-button"
                    sx={{
                      fontSize: "25px",
                      cursor: "pointer",
                      "&:hover": { color: variables.pinkred },
                    }}
                  />
                </div>
              </div>

              <div className="basic">
                <h4>Bedrooms</h4>
                <div className="basic_count">
                  <RemoveCircleOutline
                    onClick={() =>
                      setBedroomCount((prev) => Math.max(prev - 1, 1))
                    }
                    sx={{
                      fontSize: "25px",
                      cursor: "pointer",
                      "&:hover": { color: variables.pinkred },
                    }}
                  />
                  <span>{bedroomCount}</span>
                  <AddCircleOutline
                    onClick={() => setBedroomCount((prev) => prev + 1)}
                    className="basic-button"
                    sx={{
                      fontSize: "25px",
                      cursor: "pointer",
                      "&:hover": { color: variables.pinkred },
                    }}
                  />
                </div>
              </div>

              <div className="basic">
                <h4>Beds</h4>
                <div className="basic_count">
                  <RemoveCircleOutline
                    onClick={() => setBedCount((prev) => Math.max(prev - 1, 1))}
                    className="basic-button"
                    sx={{
                      fontSize: "25px",
                      cursor: "pointer",
                      "&:hover": { color: variables.pinkred },
                    }}
                  />
                  <span>{bedCount}</span>
                  <AddCircleOutline
                    onClick={() => setBedCount((prev) => prev + 1)}
                    className="basic-button"
                    sx={{
                      fontSize: "25px",
                      cursor: "pointer",
                      "&:hover": { color: variables.pinkred },
                    }}
                  />
                </div>
              </div>

              <div className="basic">
                <h4>Bathrooms</h4>
                <div className="basic_count">
                  <RemoveCircleOutline
                    onClick={() =>
                      setBathroomCount((prev) => Math.max(prev - 1, 1))
                    }
                    className="basic-button"
                    sx={{
                      fontSize: "25px",
                      cursor: "pointer",
                      "&:hover": { color: variables.pinkred },
                    }}
                  />
                  <span>{bathroomCount}</span>
                  <AddCircleOutline
                    onClick={() => setBathroomCount((prev) => prev + 1)}
                    className="basic-button"
                    sx={{
                      fontSize: "25px",
                      cursor: "pointer",
                      "&:hover": { color: variables.pinkred },
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="update-listing_step2">
            <h2>Step 2: Make your place stand out</h2>
            <hr />

            <h3>Tell buyer what your place has to offer</h3>
            <div
              className="amenities"
              style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}
            >
              {facilities?.map((item, index) => (
                <div
                  className={`facility ${
                    amenities.includes(item.name) ? "selected" : ""
                  }`}
                  key={index}
                  onClick={() => handleSelectAmenities(item.name)}
                >
                  <div className="facility_icon">{item.icon}</div>
                  <p>{item.name}</p>
                </div>
              ))}
            </div>

            <div className="update-listing_step3" style={{ marginTop: "20px" }}>
              <h2>Step 3: Upload Photos</h2>
            </div>

            <hr />

            <div
              className="photos"
              style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}
            >
              {listing?.listingPhotoPaths?.map((item) => (
                <div
                  key={item}
                  style={{ position: "relative", display: "inline-block" }}
                >
                  <img
                    src={`${baseUrl}/${item.replace("public", "")}`}
                    alt="listing photo"
                    style={{
                      width: "120px",
                      height: "120px",
                      borderRadius: "5px",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleDeletePresentPhoto(item)}
                    style={{
                      position: "absolute",
                      top: "5px",
                      right: "5px",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      color: "red",
                      fontSize: "25px",
                      fontWeight: "bold",

                    }}
                  >
                    <BiTrash />
                  </button>
                </div>
              ))}
              </div>
              

              <div className="photos_add">
              <h3>Add some photos of your place</h3>
              <DragDropContext onDragEnd={handleDragPhoto}>
                <Droppable droppableId="photos" direction="horizontal">
                  {(provided) => (
                    <div
                      className="photos"
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                    >
                      {photos?.length < 1 && (
                        <>
                          <input
                            id="image"
                            type="file"
                            style={{ display: "none" }}
                            accept="image/*"
                            onChange={handleUploadPhotos}
                            multiple
                          />
                          <label htmlFor="image" className="alone">
                            <div className="icon">
                              <IoIosImages />
                            </div>
                            <p>Upload from your device</p>
                          </label>
                        </>
                      )}

                      {photos?.length >= 1 && (
                        <>
                          {photos.map((photo, index) => (
                            <Draggable
                              key={index}
                              draggableId={index.toString()}
                              index={index}
                            >
                              {(provided) => (
                                <div
                                  className="photo"
                                  style={{
                                    cursor: "move",
                                    position: "relative",
                                    width: "100px",
                                    height: "100px",
                                  }}
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                >
                                  <img
                                    src={URL.createObjectURL(photo)}
                                    alt="place"
                                    style={{ width: "100px", height: "100px" }}
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
                          <input
                            id="image"
                            type="file"
                            style={{ display: "none" }}
                            accept="image/*"
                            onChange={handleUploadPhotos}
                            multiple
                          />
                          <label htmlFor="image" className="together">
                            <div className="icon">
                              <IoIosImages />
                            </div>
                            <p>Upload from your device</p>
                          </label>
                        </>
                      )}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
              </div>

              <div className="update-listing_step3" style={{ marginTop: "20px" }}>
                <h2>Step 4: Describe your place</h2>
                <hr />
                <div className="description">
                  <div className="description-title">
                    <p>Listing Title</p>
                    <input
                      type="text"
                      placeholder="Listing Title"
                      name="title"
                      value={formDescription.title}
                      onChange={handleChangeDescription}
                      required
                    />
                  </div>

                  <div className="description-highlight">
                    <p>Highlight</p>
                    <input
                      type="text"
                      placeholder="Highlight"
                      name="highlight"
                      value={formDescription.highlight}
                      onChange={handleChangeDescription}
                      required
                    />
                  </div>

                  <div className="description-highlightDesc">
                    <p>Highlight Description</p>
                    <input
                      type="text"
                      placeholder="Highlight Description"
                      name="highlightDesc"
                      value={formDescription.highlightDesc}
                      onChange={handleChangeDescription}
                      required
                    />
                  </div>

                  <div className="description-desc">
                    <p>Description</p>
                    <textarea
                      rows="5"
                      placeholder="Describe your place"
                      name="description"
                      value={formDescription.description}
                      onChange={handleChangeDescription}
                      required
                    ></textarea>
                  </div>

                  <div className="description-price">
                    <p>Price per Night ($)</p>
                    <input
                      type="number"
                      placeholder="Price per Night"
                      name="price"
                      value={formDescription.price}
                      onChange={handleChangeDescription}
                      required
                    />
                  </div>
                </div>
              </div>
          </div>

          <Button
            type="submit"
            className="btn-primary"
            disabled={loading}
            variant="contained"
          >
            {loading ? "Updating..." : "Update Listing"}
          </Button>

          {error && <p className="error">{error}</p>}
        </form>
      </div>

      <Footer />
    </>
  );
};

export default UpdateListing;
