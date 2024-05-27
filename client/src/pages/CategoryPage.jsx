import { useState, useEffect } from "react";
import "../styles/List.scss";
import Navbar from "../components/Navbar";
import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setListings } from "../redux/state";
import Loader from "../components/Loader";
import ListingCard from "../components/ListingCard";
import Footer from "../components/Footer";
import { baseUrl } from "../api/api";

const CategoryPage = () => {
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { category } = useParams();

  const dispatch = useDispatch();
  const listings = useSelector((state) => state.listings);

  const getFeedListings = async (page = 1) => {
    try {
      const response = await fetch(
        `${baseUrl}/properties?category=${category}&page=${page}&limit=10`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch listings");
      }
      const data = await response.json();
      console.log("API response data:", data); // Log API response
      dispatch(setListings({ listings: data.listings })); // Access listings array
      setTotalPages(data.totalPages);
      setLoading(false);
    } catch (err) {
      console.log("Fetch Listings Failed", err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    getFeedListings(currentPage);
  }, [category, currentPage]);

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

  if (loading) {
    return <Loader />;
  }

  console.log("Listings:", listings); // Log listings
  if (!Array.isArray(listings)) {
    console.error("Listings is not an array:", listings);
    return <div>Error: Failed to load listings</div>;
  }

  return (
    <>
      <Navbar />
      <h1 className="title-list" style={{ textAlign: "center", marginTop: "50px" }}>{category} listings</h1>
      {listings.length === 0 ? (
        <div className="no-listings" style={{ textAlign: "center", marginTop: "50px" ,minHeight: "60vh"}}>
        <h1 className="no-listings" style={{ textAlign: "center", marginTop: "50px", color: "red", fontWeight: "bold", fontSize: "30px" }}>No listings found</h1>
        </div>
      ) : (
        <div className="list" style={{ minHeight: "70vh" }}>
          {listings.map(
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
          )}
        </div>
      )}
      {/* Pagination */}
      {
        totalPages > 1 && (
          <div className="pagination" style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
            <button onClick={handlePreviousPage} disabled={currentPage === 1}>
              Previous
            </button>
            <span style={{ margin: "0 10px" }}>{currentPage} of {totalPages}</span>
            <button onClick={handleNextPage} disabled={currentPage >= totalPages}>
              Next
            </button>
          </div>
        )
      }
      <Footer />
    </>
  );
};

export default CategoryPage;
