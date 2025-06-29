import Image from 'next/image';
import Link from 'next/link';

              {products.map((product) => (
                <Link href={`/product/${product._id}`} key={product._id} className="group">
                  <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-lg bg-gray-200 xl:aspect-h-8 xl:aspect-w-7">
                    <Image
                      src={product.images?.[0] || '/placeholder.jpg'}
                      alt={product.name}
                      width={400}
                      height={400}
                      className="h-full w-full object-cover object-center group-hover:opacity-75"
                    />
                  </div>
                  <h3 className="mt-4 text-sm text-gray-700">{product.name}</h3>
                  <p className="mt-1 text-lg font-medium text-gray-900">{product.price} руб.</p>
                </Link>
              ))} 