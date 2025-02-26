import { useSearchParams } from "react-router";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationLink,
  PaginationEllipsis,
  PaginationNext,
} from "./ui/pagination";

type ProductPaginationProps = {
  totalPages: number;
};

export default function ProductPagination({ totalPages }: ProductPaginationProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = Number(searchParams.get("page") ?? 1);
  if (isNaN(currentPage) || currentPage < 1) {
    return null;
  }
  const onClick = (page: number) => {
    searchParams.set("page", page.toString());
    setSearchParams(searchParams, {
      preventScrollReset: false,
    });
  };
  return (
    <div>
      <Pagination>
        <PaginationContent>
          {currentPage === 1 ? null : (
            <>
              <PaginationItem>
                <PaginationPrevious
                  to={`?page=${currentPage - 1}`}
                  role="link"
                  onClick={(event) => {
                    event.preventDefault();
                    onClick(currentPage - 1);
                  }}
                />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink
                  to={`?page=${currentPage - 1}`}
                  onClick={(event) => {
                    event.preventDefault();
                    onClick(currentPage - 1);
                  }}
                >
                  {currentPage - 1}
                </PaginationLink>
              </PaginationItem>
            </>
          )}
          <PaginationItem>
            <PaginationLink
              to={`?page=${currentPage}`}
              onClick={(event) => {
                event.preventDefault();
                onClick(currentPage);
              }}
            >
              {currentPage}
            </PaginationLink>
          </PaginationItem>
          {currentPage === totalPages ? null : (
            <>
              <PaginationItem>
                <PaginationLink
                  to={`?page=${currentPage + 1}`}
                  onClick={(event) => {
                    event.preventDefault();
                    onClick(currentPage + 1);
                  }}
                >
                  {currentPage + 1}
                </PaginationLink>
              </PaginationItem>
              {currentPage + 1 === totalPages ? null : (
                <>
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                </>
              )}
              <PaginationItem>
                <PaginationNext
                  to={`?page=${currentPage + 1}`}
                  onClick={(event) => {
                    event.preventDefault();
                    onClick(currentPage + 1);
                  }}
                />
              </PaginationItem>
            </>
          )}
        </PaginationContent>
      </Pagination>
    </div>
  );
}
