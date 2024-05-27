import { useEffect, useState } from "react";
import { categories } from "../data";
import "../styles/Listings.scss";
import ListingCard from "./ListingCard";
import Loader from "./Loader";
import { useDispatch, useSelector } from "react-redux";
import { setListings } from "../redux/state";
import { baseUrl } from "../api/api";

const Listings = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const listingsPerPage = 3;

  const listings = useSelector((state) => state.listings);

  const getFeedListings = async (page = 1, category = "All") => {
    try {
      const response = await fetch(
        category !== "All"
          ? `${baseUrl}/properties?category=${category}&page=${page}&limit=${listingsPerPage}`
          : `${baseUrl}/properties?page=${page}&limit=${listingsPerPage}`,
        {
          method: "GET",
        }
      );
      console.log(selectedCategory);


      const data = await response.json();
      dispatch(setListings({ listings: data.listings }));
      setTotalPages(data.totalPages);
      setLoading(false);
    } catch (err) {
      console.log("Fetch Listings Failed", err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    getFeedListings(currentPage, selectedCategory);
  }, [selectedCategory, currentPage]);

  const handleClickNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  const handleClickPrev = () => {
    if (currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

  return (
    <>
      <div className="category-list">
        {categories?.map((category, index) => (
          <div
            className={`category ${category.label === selectedCategory ? "selected" : ""}`}
            key={index}
            onClick={() => {
              setSelectedCategory(category.label);
              setCurrentPage(1);
            }}
          >
            <div className="category_icon">{category.icon}</div>
            <p>{category.label}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <Loader />
      ) : (
        <div className="listings">
          {listings?.length > 0 ? (
            listings.map(
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
            <p>No more listings available.</p>
          )}
        </div>
      )}

       
       {
        listings?.length > 0 && (
          <div className="pagination" style={{ display: "flex", justifyContent: "center" }}>
            <button onClick={handleClickPrev} disabled={currentPage === 1}>
              Previous
            </button>
            <span>{currentPage} of {totalPages}</span>
            <button
              onClick={handleClickNext}
              disabled={currentPage >= totalPages}
            >
              Next
            </button>
          </div>
        )
       }
    </>
  );
};

export default Listings;
