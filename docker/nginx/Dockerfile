FROM nginx:alpine

# Hapus konfigurasi default bawaan Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copy konfigurasi Nginx reverse proxy kita
COPY ./docker/nginx/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 untuk HTTP
EXPOSE 80

# Jalankan Nginx secara foreground
CMD ["nginx", "-g", "daemon off;"]