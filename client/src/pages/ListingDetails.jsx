import { useEffect, useState } from "react";
import "../styles/ListingDetails.scss";
import { useNavigate, useParams } from "react-router-dom";
import { facilities } from "../data";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { DateRange } from "react-date-range";
import Loader from "../components/Loader";
import Navbar from "../components/Navbar";
import { useSelector } from "react-redux";
import Footer from "../components/Footer";
import { baseUrl } from "../api/api";
import { Button } from "@mui/material";
import axios from "axios";

const ListingDetails = () => {
  const [loading, setLoading] = useState(true);
  const [listing, setListing] = useState(null);
  const [error, setError] = useState(null);
  const user = useSelector((state) => state.user);
  const creatorId = user?._id;
  const { listingId } = useParams();
  const customerId = useSelector((state) => state?.user?._id);
  const navigate = useNavigate();

  const getListingDetails = async () => {
    try {
      setError(null);
      setLoading(true);
      const response = await fetch(`${baseUrl}/properties/${listingId}`, {
        method: "GET",
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      if (response.status === 404) {
        throw new Error("Listing not found");
      }
      const data = await response.json();
      setListing(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getListingDetails();
  }, []);

  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);

  const handleSelect = (ranges) => {
    setDateRange([ranges.selection]);
  };

  const start = new Date(dateRange[0].startDate);
  const end = new Date(dateRange[0].endDate);
  const dayCount = Math.round((end - start) / (1000 * 60 * 60 * 24));

  const handleSubmit = async () => {
    try {
      const bookingForm = {
        customerId,
        listingId,
        hostId: listing?.creator?._id,
        startDate: dateRange[0].startDate.toDateString(),
        endDate: dateRange[0].endDate.toDateString(),
        totalPrice: listing.price * dayCount,
      };

      const response = await fetch(`${baseUrl}/bookings/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingForm),
      });

      if (response.ok) {
        navigate(`/${customerId}/trips`);
      }
    } catch (err) {
      console.log("Submit Booking Failed.", err.message);
    }
  };

  const handleDeleteListing = async () => {
    try {
      setError(null);
      setLoading(true);
      const response = await axios.delete(`${baseUrl}/listings/${listingId}`, {
        data: {
          creator: creatorId,
        },
      });
      if (response.status === 200) {
        navigate(`/${customerId}/properties`);
      } else {
        setError("Failed to delete listing, please try again");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <p style={{ color: "red" }}>{error}</p>;
  }

  if (!listing) {
    return <p>No listing found.</p>;
  }

  return (
    <>
      <Navbar />
      <div className="listing-details">
        <div className="title">
          <h1>{listing?.title}</h1>
          <div></div>
        </div>

        <div className="photos">
          {listing?.listingPhotoPaths?.map((item, index) => (
            <img
              key={index}
              src={`${baseUrl}/${item.replace("public", "")}`}
              alt="listing photo"
            />
          ))}
        </div>

        <h2>
          {listing?.type} in {listing?.city}, {listing?.province},{" "}
          {listing?.country}
        </h2>
        <p>
          {listing?.guestCount} guests - {listing?.bedroomCount} bedroom(s) -{" "}
          {listing?.bedCount} bed(s) - {listing?.bathroomCount} bathroom(s)
        </p>
        <hr />

        <div className="profile">
          <img
            src={`${baseUrl}/${listing?.creator?.profileImagePath?.replace(
              "public",
              ""
            )}`}
          />
          <h3>
            Hosted by {listing?.creator?.firstName} {listing?.creator?.lastName}
          </h3>
        </div>
        <hr />

        <h3>Description</h3>
        <p>{listing?.description}</p>
        <hr />

        <h3>{listing?.highlight}</h3>
        <p>{listing?.highlightDesc}</p>
        <hr />

        <div className="booking">
          <div>
            <h2>What this place offers?</h2>
            <div className="amenities">
              {listing?.amenities[0].split(",").map((item, index) => (
                <div className="facility" key={index}>
                  <div className="facility_icon">
                    {
                      facilities.find((facility) => facility.name === item)
                        ?.icon
                    }
                  </div>
                  <p>{item}</p>
                </div>
              ))}
            </div>
          </div>

          {user?.role === "buyer" && (
            <>
              <div className="listing-details_buttons">
                <a href={`mailto:${listing?.creator?.email}`}>
                  <Button
                    className="button"
                    style={{ width: "200px", height: "50px", margin: "10px" }}
                    variant="contained"
                    color="success"
                    size="medium"
                  >
                    Contact Host
                  </Button>
                </a>
              </div>

              <div className="date-range-calendar">
                <h2>How long do you want to stay?</h2>
                <DateRange ranges={dateRange} onChange={handleSelect} />
                <h2>
                  ${listing?.price} x {dayCount}{" "}
                  {dayCount > 1 ? "nights" : "night"}
                </h2>
                <h2>Total price: ${listing?.price * dayCount}</h2>
                <p>Start Date: {dateRange[0].startDate.toDateString()}</p>
                <p>End Date: {dateRange[0].endDate.toDateString()}</p>
                <button className="button" type="submit" onClick={handleSubmit}>
                  BOOKING
                </button>
              </div>
            </>
          )}

          {user?.role === "seller" && (
            <div
              className="listing-details_buttons"
              style={{
                display: "flex",
                flexDirection: "row",
                flexWrap: "wrap",
                justifyContent: "center",
                alignContent: "center",
                gap: "50px",
                margin: "10px",
                marginLeft: "30px",
                padding: "20px",
                width: "100%",
                height: "50px",
                textAlign: "center",
              }}
            >
              <Button
                onClick={() => navigate(`/update/${listingId}`)}
                style={{ width: "28%", height: "50px", margin: "10px" }}
                variant="contained"
                color="success"
                size="large"
              >
                Update Listing
              </Button>
              <Button
                onClick={handleDeleteListing}
                style={{ width: "28%", height: "50px", margin: "10px" }}
                variant="contained"
                color="error"
                size="large"
              >
                Delete Listing
              </Button>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ListingDetails;
