import "../styles/List.scss";
import { useDispatch, useSelector } from "react-redux";
import Navbar from "../components/Navbar";
import ListingCard from "../components/ListingCard";
import { useEffect, useState } from "react";
import { setPropertyList } from "../redux/state";
import Loader from "../components/Loader";
import Footer from "../components/Footer";
import { baseUrl } from "../api/api";

const PropertyList = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const propertyList = useSelector((state) => state.user?.propertyList) || [];

  const getPropertyList = async (page = 1) => {
    setLoading(true); // Set loading to true when fetching data
    try {
      const response = await fetch(
        `${baseUrl}/users/${user._id}/properties?page=${page}&limit=10`,
        {
          method: "GET",
        }
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      console.log("Fetched data:", data); // Log fetched data
      dispatch(setPropertyList(data.properties));
      setTotalPages(data.totalPages);
      setLoading(false);
    } catch (err) {
      console.error("Fetch all properties failed", err.message);
      setError("Failed to fetch properties. Please try again later.");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?._id) {
      getPropertyList(currentPage);
    }
  }, [user?._id, currentPage]);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  if (loading) return <Loader />;
  if (error) return <div className="error">{error}</div>;

  return (
    <>
      <Navbar />
      <h1 className="title-list">Your Property List</h1>
      <div className="list" style={{minHeight: "60vh"}}>
        {propertyList.length > 0 ? (
          propertyList.map(
            ({
              _id,
              creator,
              listingPhotoPaths,
              city,
              province,
              country,
              category,
              type,
              price,
              booking = false,
            }) => (
              <ListingCard
                key={_id}
                listingId={_id}
                creator={creator}
                listingPhotoPaths={listingPhotoPaths}
                city={city}
                province={province}
                country={country}
                category={category}
                type={type}
                price={price}
                booking={booking}
              />
            )
          )
        ) : (
          <p>No properties found.</p>
        )}
      </div>
      {propertyList.length > 0 && totalPages > 1 && (
        <div className="pagination">
          <button onClick={handlePreviousPage} disabled={currentPage === 1}>
            Previous
          </button>
          <span>
            {currentPage} of {totalPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
      <Footer />
    </>
  );
};

export default PropertyList;
