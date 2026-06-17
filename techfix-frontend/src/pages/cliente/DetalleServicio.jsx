import { useNavigate, useParams } from 'react-router-dom';
import ClienteServicioDetalleContent from './ClienteServicioDetalleContent';

export default function DetalleServicio() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <ClienteServicioDetalleContent
      servicioId={id}
      mode="page"
      onBack={() => navigate(-1)}
    />
  );
}
