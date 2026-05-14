import { useContext, useEffect, useState } from 'react';
import { ToasterContext } from '../contexts/ToasterContext.tsx';

interface Book {
  _id: string;
  title: string;
  author: string;
  description: string;
}

const Books = () => {
  const [books, setBooks] = useState<Book[] | null>(null);
  const [page, setPage] = useState(1);
  const [, setStatus] = useState('unset'); // unset, pending, success, error
  const toasterContext = useContext(ToasterContext);
  const toaster = toasterContext?.toaster;

  useEffect(() => {
    const fetchBooks = async () => {
      setStatus('pending');

      try {
        const res = await fetch(`api/books?page=${page}&limit=3`);
        const { data, message } = await res.json();
        if (!res.ok) throw new Error(message);
        setBooks(data);
        setStatus('success');
      } catch (error) {
        setStatus('error');
        if (error instanceof Error) {
          toaster?.error(error.message);
        }
      }
    };

    fetchBooks();
  }, [page, toaster?.error]);

  return (
    <>
      <h1>Books 📚</h1>
      <div className="my-10 grid grid-cols-[2rem_1fr_1fr_1fr_2rem] gap-5">
        <button
          onClick={() => setPage((prev) => (prev === 1 ? 7 : prev - 1))}
          className="btn btn-circle self-center"
        >
          ❮
        </button>
        {books?.map((book, ind) => {
          return (
            <div
              key={book._id}
              className="card bg-base-100 w-80 border shadow-sm"
            >
              <figure className="min-h-60 px-10 pt-10">
                <img
                  height={240}
                  src={`https://picsum.photos/200?random=${ind}`}
                  alt=""
                  className="rounded-xl"
                />
              </figure>
              <div className="card-body items-center text-center">
                <h2 className="card-title">{book.title}</h2>
                <h3 className="card-title text-sm">{book.author}</h3>
                <p>{book.description}</p>
                <div className="card-actions">
                  {true && (
                    <button
                      onClick={() => alert('CHANGE READING LIST')}
                      className="btn btn-primary"
                    >
                      {false ? 'Remove from' : 'Add to'} reading List
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        <button
          onClick={() => setPage((prev) => (prev === 7 ? 1 : prev + 1))}
          className="btn btn-circle self-center"
        >
          ❯
        </button>
      </div>
    </>
  );
};

export default Books;
