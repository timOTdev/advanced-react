import Head from 'next/head';
import PaginationStyles from './styles/PaginationStyles'
import Link from 'next/link';
import { useQuery } from '@apollo/client';
import gql from 'graphql-tag';
import { perPage } from '../config';
import DisplayError from "./DisplayError";

export const PAGINATION_QUERY = gql`
  query PAGINATION_QUERY {
    _allProductsMeta {
      count
    }
  }
`;

export default function Pagination({ page }) {
    const { error, loading, data } = useQuery(PAGINATION_QUERY);
    if (loading) return 'Loading...';
    if (error) return <DisplayError error={error}/>

    const { count } = data._allProductsMeta;
    const pageCount = Math.ceil(count / perPage);

    return (
      <PaginationStyles>
        <Head>
          <title>
            Sick Fits {page} Page of {pageCount}
          </title>
        </Head>
        <Link href={`/products/${page - 1}`}>
          <a aria-disabled={page == 1}>Prev</a>
        </Link>
        <p>
          {page} of {pageCount}
        </p>
        <p>{count} Items Total</p>
        <Link href={`/products/${page + 1}`}>
          <a aria-disabled={page >= pageCount}>Next</a>
        </Link>
      </PaginationStyles>
    );
}
