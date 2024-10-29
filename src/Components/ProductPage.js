import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { jsPDF } from "jspdf";
import { Link } from "react-router-dom";
import Barcode from "react-barcode";
import bwipjs from "bwip-js"; // Biblioteca para gerar códigos de barras como imagem base64
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import EditIcon from "@mui/icons-material/Edit";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { Grid, Typography } from "@mui/material";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [OpenEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [dataToInsert, setDataToInsert] = useState({
    nome: "",
    descricao: "",
    preco: "",
    precovenda: "",
    precocombo: "",
    quantidade: "",
  });
  const [productid, setProductid] = useState(null);
  const gridRef = useRef(); // Referência para a grid
  const handleOpenAddDialog = () => setOpenAddDialog(true);
  const handleCloseAddDialog = () => setOpenAddDialog(false);
  const handleCloseDeleteDialog = () => setOpenDeleteDialog(false);
  const handleOpenEditDialog = () => setOpenEditDialog(true);
  const handleCloseEditDialog = () => setOpenEditDialog(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("https://lalitaapi.onrender.com/Produtos");
        if (!response.ok) throw new Error("Erro ao buscar produtos");
        const data = await response.json();
        console.table(data);
        // Converte o objeto de produtos em um array
        const productsArray = Object.keys(data).map((key) => ({
          productid: key,
          ...data[key],
        }));

        setProducts(productsArray);
      } catch (err) {
        console.error("Erro ao buscar dados:", err);
        toast.error("Erro ao buscar dados.");
      }
    };
    fetchProducts();
  }, []);

  const handleEdit = (product) => {
    setDataToInsert({
      nome: product.nome,
      descricao: product.descricao,
      preco: product.preco,
      precovenda: product.precovenda,
      precocombo: product.precocombo,
      quantidade: product.quantidade,
    });
    setProductid(product.productid);
    setOpenEditDialog(true);
  };

  const handleEditProduct = async (e) => {
    e.preventDefault();
    try {
      const updateResponse = await fetch(
        `https://lalitaapi.onrender.com/Produtos/${productid}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nome: dataToInsert.nome,
            descricao: dataToInsert.descricao,
            preco: dataToInsert.preco,
            precovenda: dataToInsert.precovenda,
            precocombo: dataToInsert.precocombo,
            quantidade: dataToInsert.quantidade,
          }),
        }
      );

      if (!updateResponse.ok) throw new Error("Erro ao atualizar produto");
      
      if (updateResponse.ok) {
        const updatedProduct = await updateResponse.json();
        toast.success(`Produto ${dataToInsert.nome} atualizado com sucesso!`);
        setProducts(
          products.map((product) =>
            product.productid === productid ? updatedProduct : product
          )
        );
        handleCloseEditDialog();
        clearForm();
      } else {
        toast.error("Erro ao atualizar o produto");
      }
    } catch (error) {
      console.error("Erro ao atualizar produto:", error);
      toast.error("Erro ao atualizar produto.");
    }
  };

  const handleDownload = async (
    barcodeValue,
    productName,
    productDescription,
    productPrice,
    quantity
  ) => {
    const pdf = new jsPDF({
      orientation: "landscape", // Mude para 'landscape' (paisagem)
      unit: "mm",
      format: [40, 70], // 40mm de altura e 70mm de largura
    });

    for (let i = 0; i < quantity; i++) {
      // Adiciona uma nova página para cada etiqueta
      if (i > 0) {
        pdf.addPage();
      }

      // Criando um canvas temporário para o código de barras
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      // Defina a largura máxima do código de barras para se ajustar à etiqueta
      const maxBarcodeWidth = 65; // Ajuste a largura máxima do código de barras para o novo tamanho da etiqueta
      const scale = 3; // Escala do código de barras
      const barcodeHeight = 10; // Altura do código de barras em pixels

      // Calcule a largura em pixels
      const widthInPixels = maxBarcodeWidth * scale;

      // Defina o tamanho do canvas com base na largura máxima
      canvas.width = widthInPixels;
      canvas.height = barcodeHeight;

      let imgdata = null;
      try {
        // Usando bwip-js para desenhar o código de barras no canvas
        await bwipjs.toCanvas(canvas, {
          bcid: "code128", // Tipo de código de barras
          text: String(barcodeValue), // Valor do código de barras
          scale: scale, // Escala
          height: barcodeHeight, // Altura do código de barras em pixels
          includetext: false, // Exibir o valor abaixo do código de barras
        });

        // Converte o canvas para uma imagem base64
        imgdata = canvas.toDataURL("image/png");
      } catch (error) {
        console.error("Erro ao gerar código de barras:", error);
        return;
      }

      // Posicionamento inicial vertical para cada etiqueta
      let yPosition = 10;

      const imgWidth = maxBarcodeWidth; // Largura da imagem em mm
      const imgHeight = canvas.height / scale / 3.779527559; // Convertendo pixels para mm (1 pixel ≈ 0.264583 mm)

      // Centraliza o código de barras
      const xPos = (70 - imgWidth) / 2; // Centraliza na etiqueta de 70mm de largura

      // Adiciona a imagem do código de barras
      pdf.addImage(imgdata, "PNG", xPos, yPosition, imgWidth, imgHeight);
      yPosition += imgHeight + 5;

      // Define uma fonte e tamanho para os detalhes do produto
      pdf.setFont("Courier", "normal");
      pdf.setFontSize(9);
      pdf.text(`Produto: ${productName}`, 10, yPosition);
      yPosition += 5;

      pdf.setFont("Courier", "italic");
      pdf.text(`Descrição: ${productDescription}`, 10, yPosition);
      yPosition += 5;

      pdf.setFont("Courier", "normal");
      pdf.text(
        `Preço: R$ ${parseFloat(productPrice).toFixed(2)}`,
        10,
        yPosition
      );
      yPosition += 5;

      // Adiciona a data e hora de criação
      const date = new Date();
      const formattedDate = date.toLocaleString();
      pdf.setFontSize(8);
      pdf.text(`Gerado em: ${formattedDate}`, 10, yPosition);
    }

    // Salva o PDF
    pdf.save(`etiqueta_${barcodeValue}.pdf`);
  };

  const handleDelete = (id) => {
    setProductid(id);
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirmed = async () => {
    setOpenDeleteDialog(false);

    try {
      const response = await fetch(
        `https://lalitaapi.onrender.com/Produtos/${productid}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        }
      );
      if (!response.ok) throw new Error("Erro ao excluir o produto");

      toast.success("Produto excluído com sucesso");
      setProducts(
        products.filter((product) => product.productid !== productid)
      );
    } catch (error) {
      console.error("Error:", error);
      toast.error("Erro ao excluir o produto");
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();

    // Validação de campos obrigatórios
    if (
      !dataToInsert.nome ||
      !dataToInsert.preco ||
      !dataToInsert.precovenda ||
      !dataToInsert.precocombo ||
      !dataToInsert.quantidade
    ) {
      toast.error("Por favor, preencha os campos obrigatórios.");
      return;
    }

    // Validação de formato
    if (
      isNaN(dataToInsert.preco) ||
      (dataToInsert.precovenda && isNaN(dataToInsert.precovenda)) ||
      (dataToInsert.quantidade && isNaN(dataToInsert.quantidade))
    ) {
      toast.error("Por favor, insira valores numéricos válidos.");
      return;
    }

    // Validação de valores
    if (
      parseFloat(dataToInsert.preco) <= 0 ||
      (dataToInsert.quantidade && parseInt(dataToInsert.quantidade) <= 0) ||
      (dataToInsert.precovenda && parseFloat(dataToInsert.precovenda) <= 0) ||
      (dataToInsert.precocombo && parseFloat(dataToInsert.precocombo) <= 0)
    ) {
      toast.error("Por favor, insira valores positivos.");
      return;
    }

    // Validação para precovenda e precocombo serem maiores que preco
    if (
      parseFloat(dataToInsert.precovenda) <= parseFloat(dataToInsert.preco)
    ) {
      toast.error("precovenda e precocombo devem ser maiores que preco.");
      return;
    }

    try {
      const response = await fetch("https://lalitaapi.onrender.com/Produtos", {
        method: "POST",
        body: JSON.stringify(dataToInsert),
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        const data = await response.json();
        toast.success("Produto cadastrado com sucesso");
        setProducts([...products, data]);
        clearForm();
        handleCloseAddDialog();
      } else {
        const errorData = await response.json();
        toast.error(`Erro ao cadastrar produto: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Erro ao cadastrar produto.");
    }
  };

  const clearForm = () => {
    setDataToInsert({
      nome: "",
      descricao: "",
      preco: "",
      precovenda: "",
      quantidade: "",
    });
  };

  const handleChange = (e) => {
    setDataToInsert({
      ...dataToInsert,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <>
      <Grid
        container
        justifyContent="center"
        style={{
          minHeight: "100vh",
          marginTop: "0px",
          backgroundColor: "#fff",
          color: "#f5d6a8",
        }}
      >
        <Grid item xs={12} md={10} lg={8}>
          <div style={{ marginTop: "20px", padding: "10px" }}>
            <Typography variant="h4" align="center" gutterBottom>
              Lista de Produtos
            </Typography>
            <Button
              variant="contained"
              sx={{
                backgroundColor: "#f5d6a8",
                color: "#000",
                marginRight: "8px",
              }}
              startIcon={<AddIcon style={{ color: "#c0844a" }} />}
              onClick={handleOpenAddDialog}
            >
              Adicionar Produto
            </Button>
            <TableContainer component={Paper} style={{ marginTop: "20px" }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Produto Id</TableCell>
                    <TableCell>Nome</TableCell>
                    <TableCell>Descrição</TableCell>
                    <TableCell>Preço</TableCell>
                    <TableCell>Preço de Venda</TableCell>
                    <TableCell>Preço de Combo</TableCell>
                    <TableCell>Quantidade</TableCell>
                    <TableCell>Codigo de Barra</TableCell>
                    <TableCell>Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Array.isArray(products) && products.length > 0 ? (
                    products.map((product) => (
                      <TableRow key={product.productid}>
                        <TableCell>{product.productid}</TableCell>
                        <TableCell>{product.nome}</TableCell>
                        <TableCell>{product.descricao}</TableCell>
                        <TableCell>
                          R$ {parseFloat(product.preco).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          R$ {parseFloat(product.precovenda).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          R$ {parseFloat(product.precocombo).toFixed(2)}
                        </TableCell>
                        <TableCell>{product.quantidade}</TableCell>
                        <TableCell>
                          {/* Código de barras oculto */}
                          <Barcode
                            ref={gridRef}
                            value={product.productid}
                            width={2}
                            height={25}
                            displayValue={false}
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton
                            aria-label="editar"
                            onClick={() => handleEdit(product)}
                            style={{ marginRight: "5px" }}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            aria-label="excluir"
                            onClick={() => handleDelete(product.productid)}
                          >
                            <DeleteIcon />
                          </IconButton>
                          <IconButton
                            aria-label="etiqueta"
                            onClick={async () =>
                              await handleDownload(
                                product.productid,
                                product.nome,
                                product.descricao,
                                product.precovenda,
                                product.quantidade
                              )
                            }
                          >
                            <ShoppingCartIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        Nenhum produto encontrado
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <Dialog open={openAddDialog} onClose={handleCloseAddDialog}>
              <DialogTitle>Adicionar Novo Produto</DialogTitle>
              <DialogContent>
                <TextField
                  name="nome"
                  label="Nome"
                  value={dataToInsert.nome}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                />
                <TextField
                  name="descricao"
                  label="Descrição"
                  value={dataToInsert.descricao}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                />
                <TextField
                  name="preco"
                  label="Preço"
                  value={dataToInsert.preco}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                />
                <TextField
                  name="precocombo"
                  label="Preço de Combo"
                  value={dataToInsert.precocombo}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                />
                <TextField
                  name="precovenda"
                  label="Preço de Venda"
                  value={dataToInsert.precovenda}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                />
                <TextField
                  name="quantidade"
                  label="Quantidade"
                  value={dataToInsert.quantidade}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseAddDialog} color="secondary">
                  Cancelar
                </Button>
                <Button onClick={handleAddProduct} color="primary">
                  Adicionar
                </Button>
              </DialogActions>
            </Dialog>

            <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
              <DialogTitle>Confirmar Exclusão</DialogTitle>
              <DialogContent>
                Tem certeza que deseja excluir este produto?
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseDeleteDialog} color="secondary">
                  Cancelar
                </Button>
                <Button onClick={handleDeleteConfirmed} color="primary">
                  Excluir
                </Button>
              </DialogActions>
            </Dialog>

        <Dialog open={OpenEditDialog} onClose={handleCloseEditDialog}>
        <DialogTitle>Editar Produto</DialogTitle>
        <DialogContent>
          <TextField
            name="nome"
            label="Nome"
            value={dataToInsert.nome}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            name="descricao"
            label="Descrição"
            value={dataToInsert.descricao}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            name="preco"
            label="Preço"
            value={dataToInsert.preco}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            name="precocombo"
            label="Preço de Combo"
            value={dataToInsert.precocombo}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            name="precovenda"
            label="Preço de Venda"
            value={dataToInsert.precovenda}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            name="quantidade"
            label="Quantidade"
            value={dataToInsert.quantidade}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog} color="secondary">
            Cancelar
          </Button>
          <Button onClick={handleEditProduct} color="primary">
            Salvar Alterações
          </Button>
        </DialogActions>
      </Dialog>
          </div>
        </Grid>
      </Grid>
      <ToastContainer />
    </>
  );
}

export default ProductsPage;
