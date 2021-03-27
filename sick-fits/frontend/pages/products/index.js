import { useRouter } from "next/dist/client/router";
import Pagination from "../../components/Pagination";
import Products from "../../components/Products";

export default function ProductsPage() {
    const { query } = useRouter();
    const page = parseInt(query.page); // Have to parse string to int

    return (
      <div>
        <Pagination page={page || 1} />
        <Products />
        <Pagination page={page || 1} />
      </div>
    );
}
