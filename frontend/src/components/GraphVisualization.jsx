import React, { useEffect, useRef } from 'react';
import cytoscape from 'cytoscape';
import fcose from 'cytoscape-fcose';
import './GraphVisualization.css';

// Registrar el layout
cytoscape.use(fcose);

function GraphVisualization({ data }) {
  const cyRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!data || !data.nodes || !data.edges) return;

    // ✅ OPTIMIZACIÓN: Filtrar nodos con pocas conexiones
    const MIN_DEGREE = 1; // Mostrar nodos con al menos 1 conexión
    const filteredNodes = data.nodes.filter(node => node.degree >= MIN_DEGREE);
    const nodeIds = new Set(filteredNodes.map(n => n.id));
    
    // Solo incluir aristas entre nodos filtrados
    const filteredEdges = data.edges.filter(edge => 
      nodeIds.has(edge.source) && nodeIds.has(edge.target)
    );

    console.log(`📊 Mostrando ${filteredNodes.length} de ${data.nodes.length} nodos`);

    // Preparar elementos para Cytoscape
    const elements = [
      ...filteredNodes.map(node => ({
        data: { 
          id: node.id, 
          label: node.label,
          degree: node.degree 
        }
      })),
      ...filteredEdges.map(edge => ({
        data: { 
          source: edge.source, 
          target: edge.target,
          weight: edge.weight,
          count: edge.count
        }
      }))
    ];

    // Inicializar Cytoscape
    cyRef.current = cytoscape({
      container: containerRef.current,
      elements: elements,
      style: [
        {
          selector: 'node',
          style: {
            'background-color': '#667eea',
            'label': 'data(label)',
            'color': '#fff',
            'text-valign': 'center',
            'text-halign': 'center',
            'font-size': '10px',
            'width': (ele) => Math.min(20 + ele.data('degree') * 3, 60),
            'height': (ele) => Math.min(20 + ele.data('degree') * 3, 60),
            'text-outline-width': 2,
            'text-outline-color': '#667eea'
          }
        },
        {
          selector: 'edge',
          style: {
            'width': (ele) => Math.min(ele.data('count') * 0.5, 5),
            'line-color': '#cbd5e0',
            'target-arrow-color': '#cbd5e0',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'arrow-scale': 1.5
          }
        },
        {
          selector: 'node:selected',
          style: {
            'background-color': '#f5576c',
            'border-width': 3,
            'border-color': '#fff'
          }
        },
        {
          selector: 'edge:selected',
          style: {
            'line-color': '#f5576c',
            'target-arrow-color': '#f5576c',
            'width': 4
          }
        }
      ],
      layout: {
        name: 'cose',  // Layout más rápido que fcose
        animate: false,  // Sin animación = carga instantánea
        randomize: false,
        fit: true,
        padding: 30,
        nodeRepulsion: 8000,
        idealEdgeLength: 50,
        edgeElasticity: 100,
        nestingFactor: 5,
        gravity: 80,
        numIter: 300,  // Reducido para velocidad
        initialTemp: 200,
        coolingFactor: 0.95,
        minTemp: 1.0
      }
    });

    // Event listeners
    cyRef.current.on('tap', 'node', function(evt) {
      const node = evt.target;
      const nodeData = node.data();
      
      alert(`Cuenta: ${nodeData.label}\nGrado: ${nodeData.degree}\n(Número de conexiones)`);
    });

    cyRef.current.on('tap', 'edge', function(evt) {
      const edge = evt.target;
      const edgeData = edge.data();
      
      alert(`De: ${edgeData.source}\nHacia: ${edgeData.target}\nTransacciones: ${edgeData.count}\nMonto Total: $${edgeData.weight.toFixed(2)}`);
    });

    // Cleanup
    return () => {
      if (cyRef.current) {
        cyRef.current.destroy();
      }
    };
  }, [data]);

  if (!data) {
    return <div>Cargando grafo...</div>;
  }

  return (
    <div className="graph-container">
      <div className="graph-header">
        <h2>🕸️ Red de Transacciones</h2>
        <div className="graph-legend">
          <div className="legend-item">
            <div className="legend-circle normal"></div>
            <span>Cuenta Normal</span>
          </div>
          <div className="legend-item">
            <div className="legend-circle selected"></div>
            <span>Cuenta Seleccionada</span>
          </div>
          <div className="legend-item">
            <div className="legend-arrow"></div>
            <span>Transacción (grosor = cantidad)</span>
          </div>
        </div>
        <p className="graph-hint">💡 Haz clic en nodos o aristas para ver detalles</p>
      </div>
      <div ref={containerRef} className="cytoscape-container"></div>
      <div className="graph-stats">
        <span>Total Nodos: {data.nodes.length}</span>
        <span>Total Aristas: {data.edges.length}</span>
      </div>
    </div>
  );
}

export default GraphVisualization;