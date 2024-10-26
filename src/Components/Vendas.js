import React, { useState, useEffect } from 'react';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import { format } from 'date-fns';
import EditIcon from '@mui/icons-material/Edit';
import { toast } from 'react-toastify';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Paper from '@mui/material/Paper';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Button, Grid, Typography, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import DoneIcon from '@mui/icons-material/Done';

function SalesPage() {
  const [sales, setSales] = useState([]);
  const [ItensSales, setItensSales] = useState([]);
  const [selectedSale, setSelectedSale] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [Vendaid, setVendaid] = useState(null);
  const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
  const [saleIdToUpdate, setSaleIdToUpdate] = useState(null);
  const [filteredSales, setFilteredSales] = useState([]);
  const [filterloading, setFilterloading] = useState(false);
  useEffect(() => {
    fetchSales();
  }, []);

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
  };
  
  const handleCloseUpdateDialog = () => {
    setOpenUpdateDialog(false);
  };
  
console.table(filteredSales);

  const fetchSales = () => {
      fetch("https://lalitaapi.onrender.com/Vendas")
      .then((res) => res.json())
      .then((data) => {
           // Converte o objeto de produtos em um array
      const vendasArray = Object.keys(data).map(key => ({
        Vendaid: key,
        ...data[key]
      }));
        setSales(vendasArray);
        setFilteredSales(vendasArray); // Ao buscar as vendas, inicialmente exibir todas
      })
      .catch((err) => {
        console.error(err);
        toast.error("Erro ao buscar vendas.");
      });
  };

  const updateSaleStatus = (id) => {
    setSaleIdToUpdate(id);
    setOpenUpdateDialog(true);
  };

  const handleUpdateConfirmed = () => {
    setOpenUpdateDialog(false);
    fetch("https://lalitaapi.onrender.com/Vendas", {
      method: "PUT",
      body: JSON.stringify({
        Vendaid: saleIdToUpdate,
        situacao: 'Concluída'
      }),
      headers: { "Content-Type": "application/json" },
    }).then(() => {
      toast.success('Venda Atualizada com sucesso');
      fetchSales();
    }).catch((error) => {
      console.error("Error:", error);
    });
  };

  const handleDelete = (id) => {
    setVendaid(id);
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirmed = () => {
    setOpenDeleteDialog(false);
    fetch(`https://lalitaapi.onrender.com/Vendas/${Vendaid}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    }).then(() => {
      toast.success('Venda excluída com sucesso');
      fetchSales();
    }).catch((error) => {
      console.error("Error:", error);
    });
  };
  

  const fetchSaleItems = async (Vendaid) => {
    try {
      const response = await fetch(`https://lalitaapi.onrender.com/Vendas/itens/${Vendaid}`);
      const data = await response.json();
          // Converte o objeto de produtos em um array
          const ItensArray = Object.keys(data).map(key => ({
            itemId: key,
            ...data[key]
          }));
    
      return ItensArray;
    } catch (error) {
      console.error("Erro ao obter itens da venda:", error);
      throw error;
    }
  };

  const toggleSaleDetails = async (sale) => {
    if (selectedSale === sale) {
      setSelectedSale(null);
    } else {
      try {
        const saleItems = await fetchSaleItems(sale.Vendaid);
        setItensSales(saleItems);
        setSelectedSale(sale);
      } catch (error) {
        console.error("Erro ao buscar itens da venda:", error);
        toast.error("Erro ao buscar itens da venda.");
      }
    }
  };

  const handleStartDateChange = (date) => {
    setStartDate(date);
  };

  const handleEndDateChange = (date) => {
    setEndDate(date);
  };

  const handleFilter = () => {
    if (startDate && endDate) {
      const filtered = sales.filter(sale => {
        const saleDate = new Date(sale.data_venda);
        return saleDate >= startDate && saleDate <= endDate;
      });
      setFilteredSales(filtered);
      setFilterloading(true);
    } else {
      setFilteredSales(sales); // Se nenhuma data selecionada, exibir todas as vendas
    }
  };

  const clearFilter = () => {
    setFilterloading(false);
    setStartDate(null);
    setEndDate(null);
    setFilteredSales(sales); // Atualiza para mostrar todas as vendas novamente
  };

  return (
    <Grid container justifyContent="center" style={{ minHeight: '100vh', marginTop: '0px', backgroundColor: '#fff', color: '#f5d6a8' }}>
      <Grid item xs={12} md={10} lg={8}>
        <h1 style={{ textAlign: 'center' }}>Lista de Vendas</h1>
        <Grid container spacing={2} justifyContent="center" sx={{ flexDirection: 'column', textAlign: 'center' }}>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="body1">De:</Typography>
            <DatePicker
              selected={startDate}
              onChange={handleStartDateChange}
              dateFormat="dd/MM/yyyy"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="body1">Até:</Typography>
            <DatePicker
              selected={endDate}
              onChange={handleEndDateChange}
              dateFormat="dd/MM/yyyy"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button variant="contained" style={{ color: '#fff', backgroundColor: '#f5d6a8'}} onClick={handleFilter}>Filtrar</Button>
            {filterloading && (
            <IconButton aria-label="excluir" onClick={clearFilter}>
              <Typography variant="body1">Desfazer Filtragem</Typography>
              <DeleteIcon />
            </IconButton>
           )}
          </Grid>
        </Grid>
        <TableContainer component={Paper} style={{ marginTop: '20px' }}>
          <Table aria-label="vendas">
            <TableHead>
              <TableRow>
                <TableCell>Venda</TableCell>
                <TableCell>Data</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredSales.map((sale) => (
                <React.Fragment key={sale.Vendaid}>
                  <TableRow>
                    <TableCell>{sale.Vendaid}</TableCell>
                    <TableCell>{new Date(sale.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>R$ {sale.totalprice}</TableCell>
                    <TableCell>
                      <IconButton aria-label="ver detalhes" onClick={() => toggleSaleDetails(sale)}>
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton aria-label="editar">
                        <EditIcon />
                      </IconButton>
                      <IconButton aria-label="excluir" onClick={() => handleDelete(sale.Vendaid)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                  {selectedSale === sale && (
                    <TableRow>
                      <TableCell colSpan={4}>
                        <h3>Detalhes da Venda:</h3>
                        <ul>
                          {ItensSales.map((item) => (
                            <li key={item.itemId}>
                              <p>Produto: {item.nome}</p>
                              <p>Descrição: {item.descricao}</p>
                              <p>Preço Unitário: R$ {parseFloat(item.precovenda)}</p>
                              <p>Quantidade: {item.quantidade}</p>
                            </li>
                          ))}
                          <li>
                            <p>Pagamento: {sale.pagamento}</p>
                            <p>Situação: {sale.situacao}</p>
                            <p>Cliente: {sale.clientid}</p>
                            {sale.situacao === 'Pendente' && (
                              <IconButton onClick={() => updateSaleStatus(sale.Vendaid)}>
                                <DoneIcon />
                                TextField
                              </IconButton>
                            )}
                          </li>
                        </ul>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        
        <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
          <DialogTitle>Excluir Venda</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Tem certeza que deseja excluir esta venda?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDeleteDialog} color="primary">
              Cancelar
            </Button>
            <Button onClick={handleDeleteConfirmed} color="secondary" autoFocus>
              Excluir
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={openUpdateDialog} onClose={handleCloseUpdateDialog}>
          <DialogTitle>Atualizar Venda</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Tem certeza que deseja Atualizar esta venda?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseUpdateDialog} color="primary">
              Cancelar
            </Button>
            <Button onClick={handleUpdateConfirmed} color="secondary" autoFocus>
              Atualizar
            </Button>
          </DialogActions>
        </Dialog>
      </Grid>
    </Grid>
  );
}

export default SalesPage;
