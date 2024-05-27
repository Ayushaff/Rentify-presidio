import { useParams } from "react-router-dom";
import "../styles/List.scss";
import { useSelector, useDispatch } from "react-redux";
import { setListings } from "../redux/state";
import { useEffect, useState } from "react";
import Loader from "../components/Loader";
import Navbar from "../components/Navbar";
import ListingCard from "../components/ListingCard";
import Footer from "../components/Footer";
import { baseUrl } from "../api/api";

const SearchPage = () => {
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { search } = useParams();
  const listings = useSelector((state) => state.listings);

  const dispatch = useDispatch();

  const getSearchListings = async (page = 1) => {
    setLoading(true);
    try {
      const response = await fetch(`${baseUrl}/properties/search/${search}?page=${page}&limit=10`, {
        method: "GET"
      });

      const data = await response.json();
      dispatch(setListings({ listings: data.listings }));
      setTotalPages(data.totalPages);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.log("Fetch Search List failed!", err.message);
    }
  };

  useEffect(() => {
    getSearchListings(currentPage);
  }, [search, currentPage]);

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

  return (
    <>
      <Navbar />
      <h1 className="title-list">{search}</h1>
      <div className="list">
        {listings?.length === 0 ? (
          <h1 className="no-listings" style={{ textAlign: "center", marginTop: "50px", color: "red", fontWeight: "bold", fontSize: "30px" }}>No listings found</h1>
        ) : (
          listings?.map(
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
        )}
      </div>
      <div className="pagination" style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
        <button onClick={handlePreviousPage} disabled={currentPage === 1}>
          Previous
        </button>
        <span style={{ margin: "0 10px" }}>{currentPage} of {totalPages}</span>
        <button onClick={handleNextPage} disabled={currentPage === totalPages}>
          Next
        </button>
      </div>
      <Footer />
    </>
  );
};

export default SearchPage;
