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
  const listingsPerPage = 3;

  const listings = useSelector((state) => state.listings);
  // const user = useSelector((state) => state.user);
  // const propertyList = user?.propertyList;
  
  const getFeedListings = async () => {
    try {
      const response = await fetch(
        selectedCategory !== "All"
          ? `${baseUrl}/properties?category=${selectedCategory}`
          : `${baseUrl}/properties`,
        {
          method: "GET",
        }
      );

      const data = await response.json();
      dispatch(setListings({ listings: data }));
      setLoading(false);
    } catch (err) {
      console.log("Fetch Listings Failed", err.message);
    }
  };

  useEffect(() => {
    getFeedListings();
  }, [selectedCategory]);

  const handleClickNext = () => {
    setCurrentPage((prevPage) => prevPage + 1);
  };

  const handleClickPrev = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  const currentListings = listings?.slice(
    (currentPage - 1) * listingsPerPage,
    currentPage * listingsPerPage
  );

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
          {currentListings?.length>0 ? (
            currentListings.map(
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
      
      <div className="pagination" style={{ display: "flex", justifyContent: "center" }}>
        <button onClick={handleClickPrev} disabled={currentPage === 1} >
          Previous
        </button>
        {currentPage}
        <button
          onClick={handleClickNext}
          disabled={currentListings?.length < listingsPerPage}
        >
          Next
        </button>
      </div>
    </>
  );
};

export default Listings;
