import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const DonateContext = createContext();

export const DonateProvider = ({
  children,
}) => {
  const [donates, setDonates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDonates = async () => {
      try {
        const res = await fetch(
          `${process.env.REACT_APP_SERVER_API_URL}/donates`
        );

        const data = await res.json();

        const sorted = [...data].sort(
          (a, b) => b.amount - a.amount
        );

        setDonates(sorted);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDonates();
  }, []);

  return (
    <DonateContext.Provider
      value={{
        donates,
        loading,
      }}
    >
      {children}
    </DonateContext.Provider>
  );
};

export const useDonates = () =>
  useContext(DonateContext);